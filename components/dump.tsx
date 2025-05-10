"use client";

import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  Text,
  ActivityIndicator,
  FAB,
  Button,
  IconButton,
  Chip,
} from "react-native-paper";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  UrlTile,
  Callout,
} from "react-native-maps";
import * as Location from "expo-location";
import { useTheme } from "@/providers/theme-provider";
import {
  Layers,
  Navigation,
  Search,
  X,
  CornerDownLeft,
  MapPin,
  RotateCcw,
  Car,
  Bike,
  User,
  Pause,
  Compass,
  ArrowUp,
} from "lucide-react-native";
import { useTranslation } from "@/providers/language-provider";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import axios from "axios";
import { getDistance } from "geolib";

const { width, height } = Dimensions.get("window");

// Custom marker images
const markerImages = {
  start: require("@/assets/images/react-logo.png"),
  end: require("@/assets/images/react-logo.png"),
  waypoint: require("@/assets/images/react-logo.png"),
  user: require("@/assets/images/react-logo.png"),
  navigation: require("@/assets/images/react-logo.png"),
};

type Point = {
  latitude: number;
  longitude: number;
  name: string;
};

type RouteInfo = {
  distance: string;
  duration: string;
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  legs: any[];
  steps: {
    maneuver: {
      instruction: string;
      type: string;
      modifier?: string;
    };
    distance: number;
    duration: number;
    name: string;
    geometry: {
      coordinates: [number, number][];
    };
  }[];
};

type NavigationInstruction = {
  text: string;
  distance: string;
  maneuverType: string;
  modifier?: string;
};

export default function MapScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Routing state
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [waypoints, setWaypoints] = useState<Point[]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [directions, setDirections] = useState<string[]>([]);
  const [transportMode, setTransportMode] = useState<
    "car" | "bicycle" | "pedestrian"
  >("car");
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationInstructions, setNavigationInstructions] = useState<
    NavigationInstruction[]
  >([]);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [distanceToNextManeuver, setDistanceToNextManeuver] = useState<
    string | null
  >(null);
  const [remainingDistance, setRemainingDistance] = useState<string | null>(
    null
  );
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [locationWatchId, setLocationWatchId] =
    useState<Location.LocationSubscription | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [isMapRotated, setIsMapRotated] = useState(false);

  // Animation values
  const directionsHeight = useSharedValue(0);
  const directionsOpacity = useSharedValue(0);
  const navigationInstructionScale = useSharedValue(1);

  const directionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: directionsHeight.value,
      opacity: directionsOpacity.value,
    };
  });

  const navigationInstructionAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: navigationInstructionScale.value }],
    };
  });

  // Effect for directions panel animation
  useEffect(() => {
    if (showDirections) {
      directionsHeight.value = withTiming(height * 0.4, { duration: 300 });
      directionsOpacity.value = withTiming(1, { duration: 300 });
    } else {
      directionsHeight.value = withTiming(0, { duration: 300 });
      directionsOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [showDirections]);

  // Initial location setup
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg(t("map.locationPermissionDenied"));
          setIsLoading(false);
          return;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation(currentLocation);
        setIsLoading(false);
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg(t("map.locationError"));
        setIsLoading(false);
      }
    })();

    // Clean up location subscription on unmount
    return () => {
      if (locationWatchId) {
        locationWatchId.remove();
      }
    };
  }, [t]);

  // Start/stop location tracking when navigation mode changes
  useEffect(() => {
    const startLocationTracking = async () => {
      if (isNavigating) {
        // Request foreground permissions if not already granted
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(t("common.error"), t("map.locationPermissionDenied"), [
            { text: t("common.ok") },
          ]);
          setIsNavigating(false);
          return;
        }

        // Start watching position with high accuracy
        const watchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 5, // Update every 5 meters
            timeInterval: 1000, // Or at least every second
          },
          (newLocation) => {
            setLocation(newLocation);

            // Update heading if available
            if (newLocation.coords.heading !== null) {
              setHeading(newLocation.coords.heading);
            }

            // Update navigation progress
            updateNavigationProgress(newLocation);
          }
        );

        setLocationWatchId(watchId);

        // Center and rotate map to follow user
        if (mapRef.current && location) {
          centerMapOnUserLocation(true);
        }
      } else {
        // Stop watching position
        if (locationWatchId) {
          locationWatchId.remove();
          setLocationWatchId(null);
        }

        // Reset map rotation
        if (isMapRotated && mapRef.current) {
          mapRef.current.animateCamera({
            heading: 0,
            pitch: 0,
            zoom: 15,
            center: {
              latitude: location?.coords.latitude || 0,
              longitude: location?.coords.longitude || 0,
            },
          });
          setIsMapRotated(false);
        }
      }
    };

    startLocationTracking();
  }, [isNavigating]);

  // Update navigation progress based on current location
  const updateNavigationProgress = (newLocation: Location.LocationObject) => {
    if (!routeCoordinates.length || navigationInstructions.length === 0) return;

    // Find the closest point on the route to the current location
    let minDistance = Number.POSITIVE_INFINITY;
    let closestPointIndex = 0;

    routeCoordinates.forEach((point, index) => {
      const distance = getDistance(
        {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        },
        point
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = index;
      }
    });

    // If we're too far from the route (>50m), warn the user
    if (minDistance > 50) {
      // Only alert if we haven't already
      if (!errorMsg) {
        setErrorMsg(t("map.offRoute"));

        // Clear error after 5 seconds
        setTimeout(() => setErrorMsg(null), 5000);
      }
    }

    // Calculate remaining distance on the route
    let remainingDistanceMeters = 0;
    for (let i = closestPointIndex; i < routeCoordinates.length - 1; i++) {
      remainingDistanceMeters += getDistance(
        routeCoordinates[i],
        routeCoordinates[i + 1]
      );
    }

    // Format remaining distance
    let formattedRemainingDistance = "";
    if (remainingDistanceMeters > 1000) {
      formattedRemainingDistance = `${(remainingDistanceMeters / 1000).toFixed(
        1
      )} km`;
    } else {
      formattedRemainingDistance = `${Math.round(remainingDistanceMeters)} m`;
    }

    setRemainingDistance(formattedRemainingDistance);

    // Estimate remaining time based on average speed
    // For simplicity, we'll use fixed speeds based on transport mode
    let speedMps = 0; // meters per second
    switch (transportMode) {
      case "car":
        speedMps = 13.9; // ~50 km/h
        break;
      case "bicycle":
        speedMps = 4.2; // ~15 km/h
        break;
      case "pedestrian":
        speedMps = 1.4; // ~5 km/h
        break;
    }

    const estimatedTimeSeconds = remainingDistanceMeters / speedMps;
    let formattedRemainingTime = "";

    if (estimatedTimeSeconds > 3600) {
      const hours = Math.floor(estimatedTimeSeconds / 3600);
      const minutes = Math.floor((estimatedTimeSeconds % 3600) / 60);
      formattedRemainingTime = `${hours} h ${minutes} min`;
    } else if (estimatedTimeSeconds > 60) {
      const minutes = Math.floor(estimatedTimeSeconds / 60);
      formattedRemainingTime = `${minutes} min`;
    } else {
      formattedRemainingTime = `<1 min`;
    }

    setRemainingTime(formattedRemainingTime);

    // Determine which instruction to show
    // Find the next maneuver that's ahead of our current position
    let nextInstructionIndex = 0;
    let distanceToManeuver = 0;

    for (let i = 0; i < navigationInstructions.length; i++) {
      // Skip instructions we've already passed
      if (i < currentInstructionIndex) continue;

      // Calculate distance to this maneuver
      const instructionParts = navigationInstructions[i].distance.split(" ");
      const distance = Number.parseFloat(instructionParts[0]);
      const unit = instructionParts[1];

      // Convert to meters
      const distanceMeters = unit === "km" ? distance * 1000 : distance;

      // If this instruction is more than 50m ahead, it's our next instruction
      if (distanceMeters > 50) {
        nextInstructionIndex = i;
        distanceToManeuver = distanceMeters - minDistance;
        break;
      }
    }

    // If we've found a new instruction, update and animate
    if (nextInstructionIndex !== currentInstructionIndex) {
      setCurrentInstructionIndex(nextInstructionIndex);

      // Animate the instruction to draw attention
      navigationInstructionScale.value = withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) })
      );
    }

    // Format distance to next maneuver
    let formattedDistanceToManeuver = "";
    if (distanceToManeuver > 1000) {
      formattedDistanceToManeuver = `${(distanceToManeuver / 1000).toFixed(
        1
      )} km`;
    } else {
      formattedDistanceToManeuver = `${Math.round(distanceToManeuver)} m`;
    }

    setDistanceToNextManeuver(formattedDistanceToManeuver);

    // Center map on user if in navigation mode
    if (isNavigating && mapRef.current) {
      centerMapOnUserLocation(true);
    }
  };

  const goToCurrentLocation = () => {
    if (!location || !mapRef.current) return;

    centerMapOnUserLocation(false);
  };

  const centerMapOnUserLocation = (withHeading: boolean) => {
    if (!location || !mapRef.current) return;

    if (withHeading && heading !== null) {
      // Center and rotate map to follow user's heading
      mapRef.current.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        heading: heading,
        pitch: 45,
        zoom: 17,
        altitude: 1000,
      });
      setIsMapRotated(true);
    } else {
      // Just center on user without rotation
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const toggleRoutingMode = () => {
    if (isRoutingMode) {
      // Clear routing
      clearRoute();
    }
    setIsRoutingMode(!isRoutingMode);

    // If we were navigating, stop
    if (isNavigating) {
      setIsNavigating(false);
    }
  };

  const clearRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setWaypoints([]);
    setRouteInfo(null);
    setDirections([]);
    setShowDirections(false);
    setRouteCoordinates([]);
    setNavigationInstructions([]);
    setIsNavigating(false);
  };

  const addWaypoint = () => {
    if (!location) return;

    if (!startPoint) {
      setStartPoint({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        name: t("map.currentLocation"),
      });
    } else if (!endPoint) {
      setEndPoint({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        name: t("map.currentLocation"),
      });

      // Calculate route once we have start and end points
      setTimeout(() => {
        calculateRoute();
      }, 300);
    } else {
      const newWaypoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        name: `${t("map.waypoint")} ${waypoints.length + 1}`,
      };

      setWaypoints([...waypoints, newWaypoint]);

      // Recalculate route with the new waypoint
      setTimeout(() => {
        calculateRoute();
      }, 300);
    }
  };

  const handleMapPress = (event: any) => {
    if (!isRoutingMode) return;

    const { coordinate } = event.nativeEvent;

    if (!startPoint) {
      setStartPoint({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        name: `${t("map.startPoint")}`,
      });
    } else if (!endPoint) {
      setEndPoint({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        name: `${t("map.endPoint")}`,
      });

      // Calculate route once we have start and end points
      setTimeout(() => {
        calculateRoute();
      }, 300);
    } else {
      const newWaypoint = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        name: `${t("map.waypoint")} ${waypoints.length + 1}`,
      };

      setWaypoints([...waypoints, newWaypoint]);

      // Recalculate route with the new waypoint
      setTimeout(() => {
        calculateRoute();
      }, 300);
    }
  };

  const calculateRoute = async () => {
    if (!startPoint || !endPoint) return;

    setIsCalculatingRoute(true);

    try {
      // Convert transport mode to OSRM profile
      let profile = "car";
      switch (transportMode) {
        case "bicycle":
          profile = "bike";
          break;
        case "pedestrian":
          profile = "foot";
          break;
      }

      // Build coordinates string for the API request
      let coordinatesString = `${startPoint.longitude},${startPoint.latitude}`;

      // Add waypoints if any
      waypoints.forEach((waypoint) => {
        coordinatesString += `;${waypoint.longitude},${waypoint.latitude}`;
      });

      // Add end point
      coordinatesString += `;${endPoint.longitude},${endPoint.latitude}`;

      // Make request to OSRM API
      const response = await axios.get(
        `https://routing.openstreetmap.de/routed-${profile}/route/v1/driving/${coordinatesString}`,
        {
          params: {
            overview: "full",
            geometries: "geojson",
            steps: true,
            annotations: true,
          },
        }
      );

      if (
        response.data &&
        response.data.routes &&
        response.data.routes.length > 0
      ) {
        const route = response.data.routes[0];

        // Format distance
        const distanceInKm = route.distance / 1000;
        const formattedDistance =
          distanceInKm >= 10
            ? `${Math.round(distanceInKm)} km`
            : `${distanceInKm.toFixed(1)} km`;

        // Format duration
        const durationInMinutes = Math.round(route.duration / 60);
        let formattedDuration = "";

        if (durationInMinutes >= 60) {
          const hours = Math.floor(durationInMinutes / 60);
          const minutes = durationInMinutes % 60;
          formattedDuration = `${hours} h ${minutes} min`;
        } else {
          formattedDuration = `${durationInMinutes} min`;
        }

        // Set route info
        setRouteInfo({
          distance: formattedDistance,
          duration: formattedDuration,
        });

        // Extract turn-by-turn directions
        const extractedDirections: string[] = [];
        const extractedNavigationInstructions: NavigationInstruction[] = [];

        if (route.legs) {
          route.legs.forEach((leg: any) => {
            if (leg.steps) {
              leg.steps.forEach((step: any) => {
                if (step.maneuver && step.maneuver.instruction) {
                  extractedDirections.push(step.maneuver.instruction);

                  // Format distance for this step
                  const stepDistanceInKm = step.distance / 1000;
                  const formattedStepDistance =
                    stepDistanceInKm >= 1
                      ? `${stepDistanceInKm.toFixed(1)} km`
                      : `${Math.round(step.distance)} m`;

                  extractedNavigationInstructions.push({
                    text: step.maneuver.instruction,
                    distance: formattedStepDistance,
                    maneuverType: step.maneuver.type,
                    modifier: step.maneuver.modifier,
                  });
                }
              });
            }
          });
        }

        setDirections(extractedDirections);
        setNavigationInstructions(extractedNavigationInstructions);

        // Extract route coordinates for the polyline
        if (route.geometry && route.geometry.coordinates) {
          const coords = route.geometry.coordinates.map(
            (coord: [number, number]) => ({
              latitude: coord[1],
              longitude: coord[0],
            })
          );

          setRouteCoordinates(coords);

          // Fit map to show the entire route
          if (mapRef.current && coords.length > 0) {
            mapRef.current.fitToCoordinates(coords, {
              edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
              animated: true,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      Alert.alert(t("common.error"), t("map.routeCalculationError"), [
        { text: t("common.ok") },
      ]);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const setTransport = (mode: "car" | "bicycle" | "pedestrian") => {
    setTransportMode(mode);

    if (startPoint && endPoint) {
      // Recalculate route with new transport mode
      setTimeout(() => calculateRoute(), 300);
    }
  };

  const removeWaypoint = (index: number) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);

    // Recalculate route
    if (startPoint && endPoint) {
      setTimeout(() => calculateRoute(), 300);
    }
  };

  const startNavigation = () => {
    if (!routeCoordinates.length || !startPoint || !endPoint) {
      Alert.alert(t("common.error"), t("map.noRouteToNavigate"), [
        { text: t("common.ok") },
      ]);
      return;
    }

    setIsNavigating(true);
    setCurrentInstructionIndex(0);
    setShowDirections(false);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
  };

  const resetMapRotation = () => {
    if (!mapRef.current) return;

    mapRef.current.animateCamera({
      heading: 0,
      pitch: 0,
      zoom: 15,
      center: {
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
      },
    });
    setIsMapRotated(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          {t("map.loading")}
        </Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error }}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: location?.coords.latitude || 48.8566,
          longitude: location?.coords.longitude || 2.3522,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        rotateEnabled={true}
        scrollEnabled={!isNavigating}
        zoomEnabled={!isNavigating}
        pitchEnabled={true}
        customMapStyle={[]}
        mapType="none"
        loadingEnabled
      >
        {/* OpenStreetMap Tile Overlay */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {/* User location marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={t("map.currentLocation")}
            image={isNavigating ? markerImages.navigation : markerImages.user}
            rotation={heading || 0}
            anchor={isNavigating ? { x: 0.5, y: 0.5 } : undefined}
          />
        )}

        {/* Start point marker */}
        {startPoint && !isNavigating && (
          <Marker
            coordinate={{
              latitude: startPoint.latitude,
              longitude: startPoint.longitude,
            }}
            title={startPoint.name}
            image={markerImages.start}
            onCalloutPress={() => {
              setStartPoint(null);
              clearRoute();
            }}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{t("map.startPoint")}</Text>
                <Text style={styles.calloutText}>{startPoint.name}</Text>
              </View>
            </Callout>
          </Marker>
        )}

        {/* End point marker */}
        {endPoint && !isNavigating && (
          <Marker
            coordinate={{
              latitude: endPoint.latitude,
              longitude: endPoint.longitude,
            }}
            title={endPoint.name}
            image={markerImages.end}
            onCalloutPress={() => {
              setEndPoint(null);
              clearRoute();
            }}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{t("map.endPoint")}</Text>
                <Text style={styles.calloutText}>{endPoint.name}</Text>
              </View>
            </Callout>
          </Marker>
        )}

        {/* Waypoint markers */}
        {waypoints.map(
          (waypoint, index) =>
            !isNavigating && (
              <Marker
                key={`waypoint-${index}`}
                coordinate={{
                  latitude: waypoint.latitude,
                  longitude: waypoint.longitude,
                }}
                title={waypoint.name}
                image={markerImages.waypoint}
                onCalloutPress={() => removeWaypoint(index)}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{waypoint.name}</Text>
                    <Text style={styles.calloutText}>
                      {t("map.tapToRemove")}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            )
        )}

        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={isNavigating ? 8 : 5}
            strokeColor={isNavigating ? colors.primary : colors.primary}
            lineDashPattern={[0]}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {!isRoutingMode && !isNavigating && (
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.text} />
            <Text style={[styles.searchText, { color: colors.text }]}>
              {t("map.searchPlaceholder")}
            </Text>
          </View>
        </View>
      )}

      {isRoutingMode && !isNavigating && (
        <View
          style={[styles.routingContainer, { backgroundColor: colors.surface }]}
        >
          <View style={styles.routingHeader}>
            <Text style={[styles.routingTitle, { color: colors.text }]}>
              {t("map.routePlanner")}
            </Text>
            <IconButton
              icon={() => <X size={20} color={colors.text} />}
              size={20}
              onPress={toggleRoutingMode}
            />
          </View>

          <View style={styles.routingInputs}>
            <View style={styles.routingInputRow}>
              <View
                style={[
                  styles.routingInputIcon,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={{ color: colors.onPrimary, fontWeight: "bold" }}>
                  A
                </Text>
              </View>
              <View
                style={[
                  styles.routingInput,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={{ color: colors.text }}>
                  {startPoint ? startPoint.name : t("map.selectStartPoint")}
                </Text>
              </View>
              {startPoint && (
                <IconButton
                  icon={() => <X size={16} color={colors.text} />}
                  size={20}
                  onPress={() => {
                    setStartPoint(null);
                    clearRoute();
                  }}
                />
              )}
            </View>

            <View style={styles.routingInputRow}>
              <View
                style={[
                  styles.routingInputIcon,
                  { backgroundColor: colors.error },
                ]}
              >
                <Text style={{ color: colors.onPrimary, fontWeight: "bold" }}>
                  B
                </Text>
              </View>
              <View
                style={[
                  styles.routingInput,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={{ color: colors.text }}>
                  {endPoint ? endPoint.name : t("map.selectEndPoint")}
                </Text>
              </View>
              {endPoint && (
                <IconButton
                  key="endPointButton"
                  icon={() => <X size={16} color={colors.text} />}
                  size={20}
                  onPress={() => {
                    setEndPoint(null);
                    clearRoute();
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.transportModes}>
            <TouchableOpacity
              style={[
                styles.transportButton,
                transportMode === "car" && {
                  backgroundColor: colors.primaryContainer,
                },
              ]}
              onPress={() => setTransport("car")}
            >
              <Car size={16} color={colors.text} style={styles.transportIcon} />
              <Text style={{ color: colors.text }}>{t("map.car")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.transportButton,
                transportMode === "bicycle" && {
                  backgroundColor: colors.primaryContainer,
                },
              ]}
              onPress={() => setTransport("bicycle")}
            >
              <Bike
                size={16}
                color={colors.text}
                style={styles.transportIcon}
              />
              <Text style={{ color: colors.text }}>{t("map.bicycle")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.transportButton,
                transportMode === "pedestrian" && {
                  backgroundColor: colors.primaryContainer,
                },
              ]}
              onPress={() => setTransport("pedestrian")}
            >
              <User
                size={16}
                color={colors.text}
                style={styles.transportIcon}
              />
              <Text style={{ color: colors.text }}>{t("map.walking")}</Text>
            </TouchableOpacity>
          </View>

          {waypoints.length > 0 && (
            <View style={styles.waypointsContainer}>
              <Text style={[styles.waypointsTitle, { color: colors.text }]}>
                {t("map.waypoints")}
              </Text>
              <View style={styles.waypointsList}>
                {waypoints.map((waypoint, index) => (
                  <Chip
                    key={index}
                    style={styles.waypointChip}
                    onClose={() => removeWaypoint(index)}
                  >
                    {waypoint.name}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {isCalculatingRoute && (
            <View style={styles.calculatingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.calculatingText, { color: colors.text }]}>
                {t("map.calculatingRoute")}
              </Text>
            </View>
          )}

          {routeInfo && !isCalculatingRoute && (
            <View style={styles.routeInfoContainer}>
              <View style={styles.routeInfoItem}>
                <Text style={[styles.routeInfoLabel, { color: colors.text }]}>
                  {t("map.distance")}
                </Text>
                <Text style={[styles.routeInfoValue, { color: colors.text }]}>
                  {routeInfo.distance}
                </Text>
              </View>
              <View style={styles.routeInfoItem}>
                <Text style={[styles.routeInfoLabel, { color: colors.text }]}>
                  {t("map.duration")}
                </Text>
                <Text style={[styles.routeInfoValue, { color: colors.text }]}>
                  {routeInfo.duration}
                </Text>
              </View>
              <View style={styles.routeButtons}>
                <Button
                  mode="contained"
                  style={[
                    styles.directionsButton,
                    {
                      backgroundColor: colors.primary,
                      flex: 1,
                      marginRight: 8,
                    },
                  ]}
                  onPress={() => setShowDirections(!showDirections)}
                  disabled={directions.length === 0}
                >
                  {showDirections
                    ? t("map.hideDirections")
                    : t("map.showDirections")}
                </Button>
                <Button
                  mode="contained"
                  style={[
                    styles.navigationButton,
                    { backgroundColor: colors.primary, flex: 1 },
                  ]}
                  onPress={startNavigation}
                  textColor="#fff"
                  disabled={directions.length === 0}
                  icon={() => <Navigation size={16} color={colors.onPrimary} />}
                >
                  {t("map.startNavigation")}
                </Button>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Navigation UI */}
      {isNavigating && (
        <View
          style={[
            styles.navigationContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <View style={styles.navigationHeader}>
            <IconButton
              icon={() => <X size={24} color={colors.text} />}
              size={24}
              onPress={stopNavigation}
              style={styles.navigationCloseButton}
            />
            <View style={styles.navigationInfo}>
              {remainingDistance && (
                <Text
                  style={[styles.navigationDistance, { color: colors.text }]}
                >
                  {remainingDistance}
                </Text>
              )}
              {remainingTime && (
                <Text style={[styles.navigationTime, { color: colors.text }]}>
                  {remainingTime}
                </Text>
              )}
            </View>
          </View>

          {navigationInstructions.length > 0 &&
            currentInstructionIndex < navigationInstructions.length && (
              <Animated.View
                style={[
                  styles.navigationInstruction,
                  { backgroundColor: colors.primaryContainer },
                  navigationInstructionAnimatedStyle,
                ]}
              >
                <View style={styles.navigationInstructionContent}>
                  <View style={styles.navigationManeuverIcon}>
                    {getManeuverIcon(
                      navigationInstructions[currentInstructionIndex]
                        .maneuverType,
                      navigationInstructions[currentInstructionIndex]
                        ?.modifier ?? "",
                      colors.primary
                    )}
                  </View>
                  <View style={styles.navigationInstructionText}>
                    <Text
                      style={[
                        styles.navigationInstructionMain,
                        { color: colors.text },
                      ]}
                    >
                      {navigationInstructions[currentInstructionIndex].text}
                    </Text>
                    {distanceToNextManeuver && (
                      <Text
                        style={[
                          styles.navigationInstructionDistance,
                          { color: colors.text },
                        ]}
                      >
                        {distanceToNextManeuver}
                      </Text>
                    )}
                  </View>
                </View>
              </Animated.View>
            )}
        </View>
      )}

      {/* Directions panel */}
      {directions.length > 0 && (
        <Animated.View
          style={[
            styles.directionsPanel,
            { backgroundColor: colors.surface },
            directionsAnimatedStyle,
          ]}
        >
          <View style={styles.directionsPanelHeader}>
            <Text style={[styles.directionsPanelTitle, { color: colors.text }]}>
              {t("map.directions")}
            </Text>
            <IconButton
              icon={() => <X size={20} color={colors.text} />}
              size={20}
              onPress={() => setShowDirections(false)}
            />
          </View>
          <ScrollView style={styles.directionsScroll}>
            {directions.map((direction, index) => (
              <View key={index} style={styles.directionItem}>
                <View
                  style={[
                    styles.directionNumber,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={{ color: colors.onPrimary }}>{index + 1}</Text>
                </View>
                <Text style={[styles.directionText, { color: colors.text }]}>
                  {direction}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <View style={styles.fabContainer}>
        {isMapRotated && (
          <FAB
            icon={() => <Compass size={24} color={colors.onPrimary} />}
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={resetMapRotation}
            small
          />
        )}
        <FAB
          icon={() => <Layers size={24} color={colors.onPrimary} />}
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              marginTop: isMapRotated ? 10 : 0,
            },
          ]}
          onPress={() => {}}
          small
        />
        <FAB
          icon={() => <Navigation size={24} color={colors.onPrimary} />}
          style={[
            styles.fab,
            { backgroundColor: colors.primary, marginTop: 10 },
          ]}
          onPress={goToCurrentLocation}
          small
        />
        {!isNavigating && (
          <FAB
            icon={() =>
              isRoutingMode ? (
                <X size={24} color={colors.onPrimary} />
              ) : (
                <CornerDownLeft size={24} color={colors.onPrimary} />
              )
            }
            style={[
              styles.fab,
              {
                backgroundColor: isRoutingMode ? colors.error : colors.primary,
                marginTop: 10,
              },
            ]}
            onPress={toggleRoutingMode}
            small
          />
        )}
        {isRoutingMode && !isNavigating && (
          <FAB
            icon={() => <MapPin size={24} color={colors.onPrimary} />}
            style={[
              styles.fab,
              { backgroundColor: colors.primary, marginTop: 10 },
            ]}
            onPress={addWaypoint}
            small
          />
        )}
        {isRoutingMode && routeInfo && !isNavigating && (
          <FAB
            icon={() => <RotateCcw size={24} color={colors.onPrimary} />}
            style={[
              styles.fab,
              { backgroundColor: colors.primary, marginTop: 10 },
            ]}
            onPress={clearRoute}
            small
          />
        )}
        {isNavigating && (
          <FAB
            icon={() => <Pause size={24} color={colors.onPrimary} />}
            style={[
              styles.fab,
              { backgroundColor: colors.error, marginTop: 10 },
            ]}
            onPress={stopNavigation}
            small
          />
        )}
      </View>
    </View>
  );
}

// Helper function to get the appropriate icon for a maneuver
const getManeuverIcon = (type: string, color: string, modifier?: string) => {
  switch (type) {
    case "turn":
      if (modifier === "left") {
        return (
          <ArrowUp
            size={24}
            color={color}
            style={{ transform: [{ rotate: "-90deg" }] }}
          />
        );
      } else if (modifier === "right") {
        return (
          <ArrowUp
            size={24}
            color={color}
            style={{ transform: [{ rotate: "90deg" }] }}
          />
        );
      } else if (modifier === "slight left") {
        return (
          <ArrowUp
            size={24}
            color={color}
            style={{ transform: [{ rotate: "-45deg" }] }}
          />
        );
      } else if (modifier === "slight right") {
        return (
          <ArrowUp
            size={24}
            color={color}
            style={{ transform: [{ rotate: "45deg" }] }}
          />
        );
      } else if (modifier === "sharp left") {
        return (
          <ArrowUp
            size={24}
            color={color}
            style={{ transform: [{ rotate: "-135deg" }] }}
          />
        );
      } else if (modifier === "sharp right") {
        return (
          <ArrowUp
            size={24}
            color={color}
            style={{ transform: [{ rotate: "135deg" }] }}
          />
        );
      }
      return <ArrowUp size={24} color={color} />;
    case "continue":
      return <ArrowUp size={24} color={color} />;
    case "roundabout":
      return (
        <ArrowUp
          size={24}
          color={color}
          style={{ transform: [{ rotate: "270deg" }] }}
        />
      );
    case "arrive":
      return <MapPin size={24} color={color} />;
    default:
      return <ArrowUp size={24} color={color} />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    position: "absolute",
    top: 50,
    width: "90%",
    alignSelf: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchText: {
    marginLeft: 10,
    opacity: 0.6,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 80,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routingContainer: {
    position: "absolute",
    top: 50,
    width: "90%",
    alignSelf: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 16,
    maxHeight: height * 0.6,
  },
  routingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  routingTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  routingInputs: {
    marginBottom: 16,
  },
  routingInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  routingInputIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  routingInput: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
  },
  transportModes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  transportButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    flexDirection: "row",
    justifyContent: "center",
  },
  transportIcon: {
    marginRight: 5,
  },
  waypointsContainer: {
    marginBottom: 16,
  },
  waypointsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  waypointsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  waypointChip: {
    margin: 4,
  },
  calculatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  calculatingText: {
    marginLeft: 8,
  },
  routeInfoContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  routeInfoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  routeInfoLabel: {
    fontWeight: "bold",
  },
  routeInfoValue: {
    fontWeight: "500",
  },
  routeButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  directionsButton: {
    flex: 1,
  },
  navigationButton: {
    flex: 1,
  },
  directionsPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  directionsPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  directionsPanelTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  directionsScroll: {
    padding: 16,
  },
  directionItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  directionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  directionText: {
    flex: 1,
    lineHeight: 20,
  },
  callout: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
  },
  navigationContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navigationCloseButton: {
    marginRight: 8,
  },
  navigationInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  navigationDistance: {
    fontSize: 18,
    fontWeight: "bold",
  },
  navigationTime: {
    fontSize: 14,
    opacity: 0.8,
  },
  navigationInstruction: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  navigationInstructionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  navigationManeuverIcon: {
    marginRight: 16,
  },
  navigationInstructionText: {
    flex: 1,
  },
  navigationInstructionMain: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  navigationInstructionDistance: {
    fontSize: 14,
  },
});
