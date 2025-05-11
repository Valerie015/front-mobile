import React, { useEffect, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useTheme } from "@/providers/theme-provider";
import * as Location from "expo-location";
import { LatLng, Incident, Maneuver } from "@/types";

interface MapViewProps {
  location: LatLng | null;
  isTracking: boolean;
  heading: number | null;
  decodedCoords: LatLng[];
  startLocation: LatLng | null;
  startLabel: string;
  endLocation: LatLng | null;
  endLabel: string;
  maneuvers: Maneuver[];
  selectedRouteIndex: number;
  mapType: string;
  isRouteConfirmed: boolean;
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  onWebViewMessage: (event: WebViewMessageEvent) => void;
  queryLocation: LatLng;
  queryRadius: number;
}

const MapView: React.FC<MapViewProps> = ({
  location,
  isTracking,
  heading,
  decodedCoords,
  startLocation,
  startLabel,
  endLocation,
  endLabel,
  maneuvers,
  selectedRouteIndex,
  mapType,
  isRouteConfirmed,
  incidents,
  setIncidents,
  onWebViewMessage,
  queryLocation,
  queryRadius,
}) => {
  const { colors } = useTheme();
  const webViewRef = useRef<WebView>(null);

  const LYON_BOUNDS = {
    southWest: { latitude: 45.65, longitude: 4.7 },
    northEast: { latitude: 45.85, longitude: 5.0 },
  };

  const DEFAULT_LYON_LOCATION: LatLng = {
    latitude: 45.759,
    longitude: 4.845,
  };

  const isWithinLyon = (loc: LatLng): boolean => {
    return (
      loc.latitude >= LYON_BOUNDS.southWest.latitude &&
      loc.latitude <= LYON_BOUNDS.northEast.latitude &&
      loc.longitude >= LYON_BOUNDS.southWest.longitude &&
      loc.longitude <= LYON_BOUNDS.northEast.longitude
    );
  };

  const updateMapIncidents = useCallback(() => {
    if (webViewRef.current) {
      const incidentData = incidents
        .filter((incident) => incident.latitude != null && incident.longitude != null)
        .map((incident) => ({
          latitude: incident.latitude!,
          longitude: incident.longitude!,
          type: incident.type,
          image: incident.image || "/assets/default.png",
        }));
      console.log(`Updating ${incidentData.length} incidents on map`); // Debug log
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(`
          window.updateIncidents(${JSON.stringify(incidentData)});
          true;
        `);
      }, 100); // Slight delay to ensure WebView readiness
    }
  }, [incidents]);

  useEffect(() => {
    updateMapIncidents();
  }, [updateMapIncidents]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const setupLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newLocation = {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        };

        const displayLocation = isWithinLyon(newLocation)
          ? newLocation
          : DEFAULT_LYON_LOCATION;

        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.updateUserLocation(${displayLocation.latitude}, ${displayLocation.longitude}, ${currentPosition.coords.heading || null}, false);
            window.centerMap(${displayLocation.latitude}, ${displayLocation.longitude}, 13);
            true;
          `);
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (position) => {
            const updatedLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            const displayLocation = isWithinLyon(updatedLocation)
              ? updatedLocation
              : DEFAULT_LYON_LOCATION;
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(`
                window.updateUserLocation(${displayLocation.latitude}, ${displayLocation.longitude}, ${position.coords.heading || null}, ${isTracking});
                true;
              `);
            }
          }
        );
      } catch (error) {
        console.error("Setup error:", error);
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.updateUserLocation(${DEFAULT_LYON_LOCATION.latitude}, ${DEFAULT_LYON_LOCATION.longitude}, null, false);
            window.centerMap(${DEFAULT_LYON_LOCATION.latitude}, ${DEFAULT_LYON_LOCATION.longitude}, 13);
            true;
          `);
        }
      }
    };

    setupLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isTracking]);

  useEffect(() => {
    if (!webViewRef.current) return;

    if (decodedCoords.length > 0 && startLocation) {
      const validCoords = decodedCoords.filter((coord) => isWithinLyon(coord));
      if (validCoords.length === 0) return;

      const mapData = {
        coords: validCoords.map((c) => [c.latitude, c.longitude]),
        start: startLocation
          ? [startLocation.latitude, startLocation.longitude]
          : null,
        startLabel: startLabel || "",
        end: endLocation ? [endLocation.latitude, endLocation.longitude] : null,
        endLabel: endLabel || "",
        maneuvers: maneuvers,
        routeColor: selectedRouteIndex === 0 ? colors.primary : colors.secondary,
        centerOnStart: isRouteConfirmed,
      };
      webViewRef.current.injectJavaScript(`
        window.updateMap(${JSON.stringify(mapData)});
        true;
      `);

      if (isRouteConfirmed && startLocation) {
        webViewRef.current.injectJavaScript(`
          window.centerMap(${startLocation.latitude}, ${startLocation.longitude}, 15);
          true;
        `);
      }
    } else {

      webViewRef.current.injectJavaScript(`
        window.clearMap();
        window.centerMap(${queryLocation.latitude}, ${queryLocation.longitude}, 13);
        true;
      `);
    }

    webViewRef.current.injectJavaScript(`
      window.setMapType('${mapType}');
      true;
    `);
  }, [
    decodedCoords,
    startLocation,
    startLabel,
    endLocation,
    endLabel,
    maneuvers,
    selectedRouteIndex,
    mapType,
    isRouteConfirmed,
    queryLocation,
    colors,
  ]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={require("../app/home/map.html")}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        onError={(syntheticEvent) => {
          console.error("WebView error:", syntheticEvent.nativeEvent);
        }}
        onMessage={onWebViewMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default MapView;