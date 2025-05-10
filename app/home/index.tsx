"use client";

import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "@/providers/theme-provider";
import { decode } from "@mapbox/polyline";
import {
  useCalculateRouteMutation,
  useCreateIncidentMutation,
  useGetNearbyIncidentsQuery,
} from "@/store/api";
import debounce from "lodash.debounce";
import SearchBar from "@/components/SearchBar";
import SearchModal from "@/components/SearchModal";
import IncidentModal from "@/components/IncidentModal";
import IncidentDetailsModal from "@/components/IncidentDetailsModal";
import RouteOptions from "@/components/RouteOptions";
import AlternateRoutes from "@/components/AlternateRoutes";
import NavigationInstructions from "@/components/NavigationInstructions";
import Toolbox from "@/components/Toolbox";
import SnackbarComponent from "@/components/SnackbarComponent";
import {
  LatLng,
  ValhallaResponse,
  NominatimResult,
  Incident,
  INCIDENT_TYPES,
  Maneuver,
} from "@/types";
import MapView from "@/components/MapView";

const RouteMap: React.FC = () => {
  const { colors } = useTheme();
  const [location, setLocation] = useState<LatLng | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [isMapRotated, setIsMapRotated] = useState(false);
  const [mapType, setMapType] = useState<
    "standard" | "satellite" | "hybrid" | "terrain"
  >("standard");

  // Route states
  const [routeData, setRouteData] = useState<ValhallaResponse | null>(null);
  const [decodedCoords, setDecodedCoords] = useState<LatLng[]>([]);
  const [maneuvers, setManeuvers] = useState<Maneuver[]>([]);
  const [alternateRoutes, setAlternateRoutes] = useState<ValhallaTrip[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isRouteConfirmed, setIsRouteConfirmed] = useState<boolean>(false);
  const [recommendedRouteIndex, setRecommendedRouteIndex] = useState<number>(0);

  // Search states
  const [startQuery, setStartQuery] = useState<string>("");
  const [endQuery, setEndQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchCache, setSearchCache] = useState<{
    [key: string]: NominatimResult[];
  }>({});
  const [startLocation, setStartLocation] = useState<LatLng | null>(null);
  const [startLabel, setStartLabel] = useState<string>("");
  const [endLocation, setEndLocation] = useState<LatLng | null>(null);
  const [endLabel, setEndLabel] = useState<string>("");
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchMode, setSearchMode] = useState<"start" | "end">("end");

  // Route options
  const [costing, setCosting] = useState<string>("auto");
  const [calculateRoute] = useCalculateRouteMutation();

  // Incident states
  const [incidentLocation, setIncidentLocation] = useState<LatLng | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  const [showIncidentDetailsModal, setShowIncidentDetailsModal] =
    useState<boolean>(false);
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [createIncident, { isLoading: isCreatingIncident }] =
    useCreateIncidentMutation();
  const [routeCenter, setRouteCenter] = useState<LatLng>({
    latitude: 45.759,
    longitude: 4.845,
  });
  const queryLocation =
    startLocation && endLocation
      ? routeCenter
      : location || { latitude: 45.759, longitude: 4.845 };
  const { data: serverIncidents, refetch: refetchIncidents } =
    useGetNearbyIncidentsQuery({
      latitude: queryLocation.latitude,
      longitude: queryLocation.longitude,
      radius: 20,
    });
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  // Toolbox states
  const [isToolboxOpen, setIsToolboxOpen] = useState<boolean>(false);

  useEffect(() => {
    if (startLocation && endLocation) {
      const centerLat = (startLocation.latitude + endLocation.latitude) / 2;
      const centerLon = (startLocation.longitude + endLocation.longitude) / 2;
      setRouteCenter({ latitude: centerLat, longitude: centerLon });
    }
  }, [startLocation, endLocation]);

  useEffect(() => {
    if (serverIncidents) {
      const mappedIncidents: Incident[] = serverIncidents.map((inc) => ({
        ...inc,
        color:
          INCIDENT_TYPES.find((type) => type.type === inc.type)?.color ||
          "#FF6200",
        image:
          INCIDENT_TYPES.find((type) => type.type === inc.type)?.image ||
          "/assets/default.png",
      }));
      setIncidents(
        mappedIncidents.filter(
          (inc) => inc.isActive && new Date(inc.expiresAt) > new Date()
        )
      );
    }
  }, [serverIncidents]);

  const LYON_BOUNDS = {
    southWest: { latitude: 45.65, longitude: 4.7 },
    northEast: { latitude: 45.85, longitude: 5.0 },
  };

  const DEFAULT_LYON_LOCATION: LatLng = {
    latitude: 45.759,
    longitude: 4.845,
  };

  const isWithinLyon = (location: LatLng): boolean => {
    return (
      location.latitude >= LYON_BOUNDS.southWest.latitude &&
      location.latitude <= LYON_BOUNDS.northEast.latitude &&
      location.longitude >= LYON_BOUNDS.southWest.longitude &&
      location.longitude <= LYON_BOUNDS.northEast.longitude
    );
  };

  const haversineDistance = (point1: LatLng, point2: LatLng): number => {
    const R = 6371e3;
    const lat1 = (point1.latitude * Math.PI) / 180;
    const lat2 = (point2.latitude * Math.PI) / 180;
    const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const distanceToSegment = (
    point: LatLng,
    segmentStart: LatLng,
    segmentEnd: LatLng
  ): number => {
    const A = point.latitude - segmentStart.latitude;
    const B = point.longitude - segmentStart.longitude;
    const C = segmentEnd.latitude - segmentStart.latitude;
    const D = segmentEnd.longitude - segmentEnd.longitude;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) {
      param = dot / len_sq;
    }

    let nearest: LatLng;
    if (param < 0) {
      nearest = segmentStart;
    } else if (param > 1) {
      nearest = segmentEnd;
    } else {
      nearest = {
        latitude: segmentStart.latitude + param * C,
        longitude: segmentStart.longitude + param * D,
      };
    }

    return haversineDistance(point, nearest);
  };

  const isPointOnRoute = (
    point: LatLng,
    routeCoords: LatLng[],
    maxDistance: number = 50
  ): boolean => {
    if (!routeCoords || routeCoords.length < 2) return false;

    let minDistance = Infinity;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const distance = distanceToSegment(
        point,
        routeCoords[i],
        routeCoords[i + 1]
      );
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance <= maxDistance;
  };

  const fetchWithTimeout = async (
    url: string,
    options: RequestInit,
    timeout = 10000
  ) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  };

  const fetchWithRetry = async (
    fn: () => Promise<any>,
    retries = 2,
    delay = 500
  ) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  const getCachedResults = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    return searchCache[normalizedQuery] || null;
  };

  const cacheResults = (query: string, results: NominatimResult[]) => {
    const normalizedQuery = query.trim().toLowerCase();
    setSearchCache((prev) => ({
      ...prev,
      [normalizedQuery]: results,
    }));
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleUpdateIncident = useCallback((updatedIncident: Incident) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === updatedIncident.id ? updatedIncident : inc))
    );
  }, []);

  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.type === "routeClick") {
          const clickedLocation: LatLng = {
            latitude: message.latitude,
            longitude: message.longitude,
          };

          if (!isPointOnRoute(clickedLocation, decodedCoords)) {
            showSnackbar("L'incident doit être sur le trajet");
            return;
          }

          if (isWithinLyon(clickedLocation)) {
            setIncidentLocation(clickedLocation);
            setShowIncidentModal(true);
          } else {
            showSnackbar("L'incident doit être dans Lyon");
          }
        } else if (message.type === "incidentClick") {
          const clickedLocation: LatLng = {
            latitude: message.latitude,
            longitude: message.longitude,
          };
          const incident = incidents.find(
            (inc) =>
              inc.latitude != null &&
              inc.longitude != null &&
              Math.abs(inc.latitude - clickedLocation.latitude) < 0.00001 &&
              Math.abs(inc.longitude - clickedLocation.longitude) < 0.00001
          );
          if (incident) {
            setSelectedIncident(incident);
            setShowIncidentDetailsModal(true);
          } else {
            showSnackbar("Incident non trouvé");
          }
        }
      } catch (error) {
        console.error("Error parsing WebView message:", error);
        showSnackbar("Erreur lors du traitement du clic");
      }
    },
    [decodedCoords, incidents]
  );

  const handleCreateIncident = useCallback(async () => {
    const reportLocation = incidentLocation || location;
    if (!reportLocation || !selectedIncidentType) {
      showSnackbar("Type d'incident et localisation requis");
      return;
    }

    if (!isWithinLyon(reportLocation)) {
      showSnackbar("L'incident doit être dans Lyon");
      return;
    }

    const incidentType = INCIDENT_TYPES.find(
      (type) => type.type === selectedIncidentType
    );
    const newIncidentRequest = {
      latitude: reportLocation.latitude,
      longitude: reportLocation.longitude,
      type: selectedIncidentType,
      description: selectedIncidentType,
      expectedDuration: 1440,
    };

    try {
      const createdIncident = await createIncident(newIncidentRequest).unwrap();
      showSnackbar("Incident signalé avec succès");

      const finalIncident: Incident = {
        id: createdIncident.id,
        userId: createdIncident.userId ?? 1,
        userName: createdIncident.userName ?? "Utilisateur Anonyme",
        latitude: createdIncident.latitude,
        longitude: createdIncident.longitude,
        type: createdIncident.type,
        description: createdIncident.description,
        createdAt: createdIncident.createdAt,
        expiresAt: createdIncident.expiresAt,
        upvotes: createdIncident.upvotes,
        downvotes: createdIncident.downvotes,
        distance: createdIncident?.distance ?? 0,
        isActive: createdIncident.isActive,
        color: incidentType?.color || "#FF6200",
        image: incidentType?.image || "/assets/default.png",
      };

      setIncidents((prev) => [...prev, finalIncident]);
      refetchIncidents();
      setShowIncidentModal(false);
      setSelectedIncidentType("");
      setIncidentLocation(null);
    } catch (error) {
      console.error("Error creating incident:", error);
      showSnackbar("Erreur lors du signalement de l'incident");
    }
  }, [
    incidentLocation,
    location,
    selectedIncidentType,
    createIncident,
    refetchIncidents,
  ]);

  const searchPlaces = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      const cached = getCachedResults(query);
      if (cached) {
        setSearchResults(cached);
        setSearchLoading(false);
        return;
      }

      try {
        setSearchLoading(true);
        const response = await fetchWithRetry(() =>
          fetchWithTimeout(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              query + ", Lyon, France"
            )}&format=json&limit=5&addressdetails=1`,
            {
              headers: {
                "User-Agent": "RouteMapApp/1.0",
                Accept: "application/json",
              },
            }
          )
        );

        const data: NominatimResult[] = await response.json();
        const filteredData = data.filter((result) => {
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          return isWithinLyon({ latitude: lat, longitude: lon });
        });

        cacheResults(query, filteredData);
        setSearchResults(filteredData);
        setSearchLoading(false);
      } catch (error) {
        console.error("Error searching places:", error);
        setSearchResults([]);
        setSearchLoading(false);
        showSnackbar("Erreur de recherche");
      }
    }, 300),
    [searchCache]
  );

  const handleSearch = (text: string) => {
    if (searchMode === "start") {
      setStartQuery(text);
    } else {
      setEndQuery(text);
    }
    searchPlaces(text);
  };

  const selectLocation = async (result: NominatimResult) => {
    try {
      const selectedLoc: LatLng = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };

      if (!isWithinLyon(selectedLoc)) {
        showSnackbar(
          `Lieu hors des limites de Lyon: lat=${selectedLoc.latitude}, lon=${selectedLoc.longitude}`
        );
        setShowSearchModal(false);
        return;
      }

      if (searchMode === "start") {
        setStartLocation(selectedLoc);
        setStartLabel(result.display_name);
        setStartQuery("");
      } else {
        setEndLocation(selectedLoc);
        setEndLabel(result.display_name);
        setEndQuery("");
      }

      setSearchResults([]);
      setShowSearchModal(false);

      if (startLocation && searchMode === "end") {
        if (
          startLocation.latitude === selectedLoc.latitude &&
          startLocation.longitude === selectedLoc.longitude
        ) {
          showSnackbar("Le départ et l'arrivée ne peuvent pas être identiques");
          return;
        }
        await fetchRoute(startLocation, selectedLoc);
      } else if (endLocation && searchMode === "start") {
        if (
          selectedLoc.latitude === endLocation.latitude &&
          selectedLoc.longitude === endLocation.longitude
        ) {
          showSnackbar("Le départ et l'arrivée ne peuvent pas être identiques");
          return;
        }
        await fetchRoute(selectedLoc, endLocation);
      }
    } catch (error) {
      console.error("Error selecting location:", error);
      showSnackbar("Erreur de sélection du lieu");
    }
  };

  const useCurrentLocation = async () => {
    try {
      if (!location) {
        showSnackbar("Erreur de localisation");
        return;
      }

      if (!isWithinLyon(location)) {
        showSnackbar(
          `Lieu hors des limites de Lyon: lat=${location.latitude}, lon=${location.longitude}`
        );
        return;
      }

      setStartLocation(location);
      setStartLabel("Position actuelle");

      if (endLocation) {
        if (
          location.latitude === endLocation.latitude &&
          location.longitude === endLocation.longitude
        ) {
          showSnackbar("Le départ et l'arrivée ne peuvent pas être identiques");
          return;
        }
        await fetchRoute(location, endLocation);
      }
    } catch (error) {
      console.error("Error using current location:", error);
      showSnackbar("Erreur de localisation");
    }
  };

  const fetchRoute = useCallback(
    async (start: LatLng, end: LatLng) => {
      if (
        start.latitude === end.latitude &&
        start.longitude === end.longitude
      ) {
        setIsLoading(false);
        showSnackbar("Le départ et l'arrivée ne peuvent pas être identiques");
        return;
      }

      try {
        setIsLoading(true);

        const costingOptions = {
          auto: { use_tolls: 0 },
          motorcycle: { use_tolls: 0, use_highways: 1.0 },
          bicycle: { use_roads: 0.1, use_hills: 0.1 },
          pedestrian: { walking_speed: 5.1, use_sidewalks: 1.0 },
        };

        const calculateRouteBody = {
          startLatitude: start.latitude,
          startLongitude: start.longitude,
          endLatitude: end.latitude,
          endLongitude: end.longitude,
          transportMode: costing,
          avoidTolls: costing === "auto" || costing === "motorcycle",
        };

        await calculateRoute(calculateRouteBody).unwrap();

        const body = {
          locations: [
            { lat: start.latitude, lon: start.longitude },
            { lat: end.latitude, lon: end.longitude },
          ],
          costing: costing,
          alternates: 2,
          costing_options: costingOptions[costing],
        };

        const response = await fetchWithRetry(() =>
          fetchWithTimeout("http://10.0.2.2:8002/route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, body: ${errorText}`
          );
        }

        const data: ValhallaResponse = await response.json();

        const primaryTrip = data.trip;
        if (
          !primaryTrip?.legs[0]?.shape ||
          !primaryTrip.summary ||
          primaryTrip.summary.length > 100
        ) {
          throw new Error("Invalid route data from Valhalla");
        }

        setRouteData(data);

        const decoded = decode(primaryTrip.legs[0].shape, 6).map(
          ([lat, lon]) => ({
            latitude: lat,
            longitude: lon,
          })
        );

        const validCoords = decoded.filter((coord) => isWithinLyon(coord));
        if (validCoords.length === 0) {
          throw new Error("No valid coordinates within Lyon bounds");
        }

        setDecodedCoords(validCoords);
        setManeuvers(primaryTrip.legs[0]?.maneuvers || []);
        const newAlternates = data.alternates?.map((alt) => alt.trip) || [];
        const validAlternates = newAlternates.filter(
          (trip) => trip.summary && trip.summary.length <= 100
        );
        setAlternateRoutes(validAlternates);

        const allRoutes = [primaryTrip, ...validAlternates];
        const times = allRoutes.map((route) => route.summary.time);
        const minTimeIndex = times.indexOf(Math.min(...times));
        setRecommendedRouteIndex(minTimeIndex);
        setSelectedRouteIndex(0);
        refetchIncidents();
      } catch (error: any) {
        console.error("Error fetching route:", error);
        showSnackbar(
          `Erreur de calcul du trajet: ${
            error.message || "Échec du calcul pour le mode " + costing
          }`
        );
        setRouteData(null);
        setDecodedCoords([]);
        setManeuvers([]);
        setAlternateRoutes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [costing, startLabel, endLabel, refetchIncidents]
  );

  const debouncedFetchRoute = useCallback(
    debounce((start: LatLng, end: LatLng) => {
      fetchRoute(start, end);
    }, 300),
    [fetchRoute]
  );

  const selectAndConfirmRoute = (index: number) => {
    if (!routeData || index > alternateRoutes.length || !startLocation) return;

    setSelectedRouteIndex(index);
    const selectedTrip =
      index === 0 ? routeData.trip : alternateRoutes[index - 1];

    if (selectedTrip && selectedTrip.legs[0]?.shape) {
      const decoded = decode(selectedTrip.legs[0].shape, 6).map(
        ([lat, lon]) => ({
          latitude: lat,
          longitude: lon,
        })
      );

      const validCoords = decoded.filter((coord) => isWithinLyon(coord));
      if (validCoords.length === 0) {
        showSnackbar("Coordonnées de trajet invalides");
        return;
      }

      setDecodedCoords(validCoords);
      setManeuvers(selectedTrip.legs[0]?.maneuvers || []);
      setIsRouteConfirmed(true);
      refetchIncidents();
    } else {
      showSnackbar("Aucune donnée de trajet");
    }
  };

  const startRoute = async () => {
    if (!startLocation || !endLocation) {
      showSnackbar("Sélectionnez un point de départ et une destination");
      return;
    }

    if (
      startLocation.latitude === endLocation.latitude &&
      startLocation.longitude === endLocation.longitude
    ) {
      showSnackbar("Le départ et l'arrivée ne peuvent pas être identiques");
      return;
    }

    try {
      await fetchRoute(startLocation, endLocation);
      selectAndConfirmRoute(0);
    } catch (error) {
      console.error("Error starting route:", error);
      showSnackbar("Erreur de démarrage du trajet");
    }
  };

  const cancelConfirmedRoute = () => {
    setIsRouteConfirmed(false);
    setIsTracking(false);
    if (startLocation && endLocation) {
      fetchRoute(startLocation, endLocation);
    }
  };

  const handleBack = () => {
    if (isRouteConfirmed) {
      cancelConfirmedRoute();
    } else if (startLocation || endLocation) {
      setStartLocation(null);
      setEndLocation(null);
      setStartLabel("");
      setEndLabel("");
      setRouteData(null);
      setDecodedCoords([]);
      setManeuvers([]);
      setAlternateRoutes([]);
      setSelectedRouteIndex(0);
      setRecommendedRouteIndex(0);
      setRouteCenter({ latitude: 45.759, longitude: 4.845 });
      refetchIncidents(); // Refresh incidents for default location
    }
  };

  const centerMapOnUserLocation = (withHeading: boolean) => {
    if (!location) return;

    const displayLocation = isWithinLyon(location)
      ? location
      : DEFAULT_LYON_LOCATION;

    if (withHeading && heading !== null) {
      setIsMapRotated(true);
      setIsTracking(true);
    }
  };

  const resetMapRotation = () => {
    setIsMapRotated(false);
  };

  const toggleMapType = () => {
    const mapTypes: ("standard" | "satellite" | "hybrid" | "terrain")[] = [
      "standard",
      "satellite",
      "hybrid",
      "terrain",
    ];
    const currentIndex = mapTypes.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % mapTypes.length;
    setMapType(mapTypes[nextIndex]);
  };

  const toggleToolbox = () => {
    setIsToolboxOpen(!isToolboxOpen);
  };

  const allRoutes = routeData ? [routeData.trip, ...alternateRoutes] : [];

  return (
    <View style={styles.container}>
      <MapView
        location={location}
        isTracking={isTracking}
        heading={heading}
        decodedCoords={decodedCoords}
        startLocation={startLocation}
        startLabel={startLabel}
        endLocation={endLocation}
        endLabel={endLabel}
        maneuvers={maneuvers}
        selectedRouteIndex={selectedRouteIndex}
        mapType={mapType}
        isRouteConfirmed={isRouteConfirmed}
        incidents={incidents}
        setIncidents={setIncidents}
        onWebViewMessage={handleWebViewMessage}
        queryLocation={queryLocation}
        queryRadius={20}
      />

      {(startLocation || endLocation || isRouteConfirmed) && (
        <View style={styles.backButtonContainer}>
          <IconButton
            icon={() => <ArrowLeft size={22} color={colors.onPrimary} />}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={handleBack}
          />
        </View>
      )}

      {!isRouteConfirmed && (
        <SearchBar
          startLabel={startLabel}
          endLabel={endLabel}
          onStartPress={() => {
            setSearchMode("start");
            setShowSearchModal(true);
          }}
          onEndPress={() => {
            setSearchMode("end");
            setShowSearchModal(true);
          }}
          onCurrentLocationPress={useCurrentLocation}
        />
      )}

      <SearchModal
        visible={showSearchModal}
        searchMode={searchMode}
        query={searchMode === "start" ? startQuery : endQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onDismiss={() => {
          setShowSearchModal(false);
          setStartQuery("");
          setEndQuery("");
          setSearchResults([]);
        }}
        onSearch={handleSearch}
        onSelect={selectLocation}
        onClear={() => {
          if (searchMode === "start") {
            setStartQuery("");
          } else {
            setEndQuery("");
          }
          setSearchResults([]);
        }}
      />

      <IncidentModal
        visible={showIncidentModal}
        selectedIncidentType={selectedIncidentType}
        isCreatingIncident={isCreatingIncident}
        onDismiss={() => {
          setShowIncidentModal(false);
          setSelectedIncidentType("");
          setIncidentLocation(null);
        }}
        onSelectType={setSelectedIncidentType}
        onSubmit={handleCreateIncident}
      />

      <IncidentDetailsModal
        visible={showIncidentDetailsModal}
        selectedIncident={selectedIncident}
        onDismiss={() => setShowIncidentDetailsModal(false)}
        onUpdateIncident={handleUpdateIncident}
        refetchIncidents={refetchIncidents}
      />

      {startLocation && endLocation && !isRouteConfirmed && (
        <RouteOptions
          costing={costing}
          isLoading={isLoading}
          onCostingChange={(value: any) => {
            setIsLoading(true);
            setCosting(value);
            setTimeout(() => {
              if (startLocation && endLocation) {
                debouncedFetchRoute(startLocation, endLocation);
              } else {
                setIsLoading(false);
                showSnackbar(
                  "Sélectionnez un point de départ et une destination"
                );
              }
            }, 0);
          }}
        />
      )}

      {!isRouteConfirmed && allRoutes.length > 0 && (
        <AlternateRoutes
          routes={allRoutes}
          recommendedRouteIndex={recommendedRouteIndex}
          onSelectRoute={selectAndConfirmRoute}
        />
      )}

      <NavigationInstructions
        isRouteConfirmed={isRouteConfirmed}
        maneuvers={maneuvers}
      />

      <Toolbox
        isToolboxOpen={isToolboxOpen}
        isMapRotated={isMapRotated}
        isTracking={isTracking}
        isRouteConfirmed={isRouteConfirmed}
        startLocation={startLocation}
        endLocation={endLocation}
        toggleToolbox={toggleToolbox}
        resetMapRotation={resetMapRotation}
        toggleMapType={toggleMapType}
        centerMapOnUserLocation={centerMapOnUserLocation}
        startRoute={startRoute}
        openIncidentModal={() => setShowIncidentModal(true)}
      />

      <SnackbarComponent
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 300,
  },
  backButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default RouteMap;