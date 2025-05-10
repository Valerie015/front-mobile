import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Keyboard } from "react-native";
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Chip,
  IconButton,
} from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { MapPin, Navigation, RotateCcw, X } from "lucide-react-native";
import * as Location from "expo-location";
import { useCalculateRouteMutation, useCreateRouteMutation } from "@/store/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

interface RouteSearchProps {
  onRouteCalculated: (routeData: any, startPoint: any, endPoint: any) => void;
  onClose: () => void;
  currentLocation: { latitude: number; longitude: number } | null;
}

const transportModes = [
  { label: "Voiture", value: "driving", icon: "car" },
  { label: "Marche", value: "walking", icon: "walk" },
  { label: "Vélo", value: "bicycling", icon: "bike" },
  { label: "Transit", value: "transit", icon: "bus" },
];

export default function RouteSearch({
  onRouteCalculated,
  onClose,
  currentLocation,
}: RouteSearchProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [startPoint, setStartPoint] = useState<any>(null);
  const [endPoint, setEndPoint] = useState<any>(null);
  const [transportMode, setTransportMode] = useState("driving");
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [isStartInputFocused, setIsStartInputFocused] = useState(false);
  const [isEndInputFocused, setIsEndInputFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  const startInputRef = useRef<any>(null);
  const endInputRef = useRef<any>(null);

  const [calculateRoute, { isLoading: isCalculating }] =
    useCalculateRouteMutation();
  const [createRoute, { isLoading: isSaving }] = useCreateRouteMutation();

  // Utiliser la position actuelle comme point de départ par défaut
  useEffect(() => {
    if (currentLocation) {
      setStartPoint({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        description: "Ma position actuelle",
      });
    }
  }, [currentLocation]);

  useEffect(() => {
    setRecentSearches([
      { description: "Domicile", latitude: 48.8566, longitude: 2.3522 },
      { description: "Travail", latitude: 48.8738, longitude: 2.295 },
    ]);
  }, []);

  const handleCalculateRoute = async () => {
    if (!startPoint || !endPoint) {
      return;
    }

    try {
      const routeRequest = {
        startLatitude: startPoint.latitude,
        startLongitude: startPoint.longitude,
        endLatitude: endPoint.latitude,
        endLongitude: endPoint.longitude,
        transportMode,
        avoidTolls,
      };

      const routeData = await calculateRoute(routeRequest).unwrap();

      // Sauvegarder l'itinéraire si l'utilisateur est authentifié
      if (authUser?.id) {
        try {
          await createRoute({
            ...routeRequest,
            // routeData est déjà géré par le backend
          }).unwrap();
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de l'itinéraire:", error);
        }
      }

      onRouteCalculated(routeData, startPoint, endPoint);
    } catch (error) {
      console.error("Erreur lors du calcul de l'itinéraire:", error);
    }
  };

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.error("Permission de localisation refusée");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setStartPoint({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        description: "Ma position actuelle",
      });
    } catch (error) {
      console.error("Erreur lors de l'obtention de la position:", error);
    }
  };

  const swapLocations = () => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
  };

  const clearStartPoint = () => {
    setStartPoint(null);
    if (startInputRef.current) {
      startInputRef.current.setAddressText("");
    }
  };

  const clearEndPoint = () => {
    setEndPoint(null);
    if (endInputRef.current) {
      endInputRef.current.setAddressText("");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("routes.searchTitle")}
        </Text>
        <IconButton
          icon={() => <X size={24} color={colors.text} />}
          onPress={onClose}
        />
      </View>

      <View style={styles.inputsContainer}>
        {/* Point de départ */}
        <View style={styles.inputWrapper}>
          <View style={styles.iconContainer}>
            <MapPin size={20} color={colors.primary} />
          </View>
          <View style={styles.inputField}>
            <GooglePlacesAutocomplete
              ref={startInputRef}
              placeholder={t("routes.startPoint")}
              onPress={(data, details = null) => {
                if (details?.geometry?.location) {
                  setStartPoint({
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                    description: data.description,
                  });
                  setIsStartInputFocused(false);
                  Keyboard.dismiss();
                }
              }}
              query={{
                key: "YOUR_GOOGLE_MAPS_API_KEY", // Remplacez par votre clé API Google Maps
                language: "fr",
              }}
              fetchDetails={true}
              styles={{
                textInput: {
                  height: 50,
                  color: colors.text,
                  fontSize: 16,
                  backgroundColor: colors.surface,
                },
                listView: {
                  position: "absolute",
                  top: 50,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.surface,
                  zIndex: 1000,
                },
                description: { color: colors.text },
              }}
              enablePoweredByContainer={false}
              onFail={(error) => console.error(error)}
              textInputProps={{
                onFocus: () => setIsStartInputFocused(true),
                onBlur: () => setIsStartInputFocused(false),
                value: startPoint?.description || "",
              }}
            />
            {startPoint && (
              <IconButton
                icon="close"
                size={20}
                onPress={clearStartPoint}
                style={styles.clearButton}
              />
            )}
          </View>
          <IconButton
            icon="crosshairs-gps"
            size={24}
            onPress={useCurrentLocation}
            style={styles.actionButton}
          />
        </View>

        {/* Bouton d'inversion */}
        <IconButton
          icon={() => <RotateCcw size={20} color={colors.primary} />}
          onPress={swapLocations}
          style={styles.swapButton}
          disabled={!startPoint || !endPoint}
        />

        {/* Point d'arrivée */}
        <View style={styles.inputWrapper}>
          <View style={styles.iconContainer}>
            <Navigation size={20} color={colors.primary} />
          </View>
          <View style={styles.inputField}>
            <GooglePlacesAutocomplete
              ref={endInputRef}
              placeholder={t("routes.endPoint")}
              onPress={(data, details = null) => {
                if (details?.geometry?.location) {
                  setEndPoint({
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                    description: data.description,
                  });
                  setIsEndInputFocused(false);
                  Keyboard.dismiss();
                }
              }}
              query={{
                key: "YOUR_GOOGLE_MAPS_API_KEY", // Remplacez par votre clé API Google Maps
                language: "fr",
              }}
              fetchDetails={true}
              styles={{
                textInput: {
                  height: 50,
                  color: colors.text,
                  fontSize: 16,
                  backgroundColor: colors.surface,
                },
                listView: {
                  position: "absolute",
                  top: 50,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.surface,
                  zIndex: 1000,
                },
                description: { color: colors.text },
              }}
              enablePoweredByContainer={false}
              onFail={(error) => console.error(error)}
              textInputProps={{
                onFocus: () => setIsEndInputFocused(true),
                onBlur: () => setIsEndInputFocused(false),
                value: endPoint?.description || "",
              }}
            />
            {endPoint && (
              <IconButton
                icon="close"
                size={20}
                onPress={clearEndPoint}
                style={styles.clearButton}
              />
            )}
          </View>
        </View>
      </View>

      {/* Options de transport */}
      <View style={styles.transportOptions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("routes.transportMode")}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.transportScroll}
        >
          {transportModes.map((mode) => (
            <Chip
              key={mode.value}
              selected={transportMode === mode.value}
              onPress={() => setTransportMode(mode.value)}
              style={[
                styles.transportChip,
                transportMode === mode.value && {
                  backgroundColor: colors.primaryContainer,
                },
              ]}
              icon={mode.icon}
            >
              {mode.label}
            </Chip>
          ))}
        </ScrollView>

        <View style={styles.optionsRow}>
          <Chip
            selected={avoidTolls}
            onPress={() => setAvoidTolls(!avoidTolls)}
            style={[
              styles.optionChip,
              avoidTolls && { backgroundColor: colors.primaryContainer },
            ]}
            icon="cash-remove"
          >
            {t("routes.avoidTolls")}
          </Chip>
        </View>
      </View>

      {/* Recherches récentes */}
      {!isStartInputFocused &&
        !isEndInputFocused &&
        recentSearches.length > 0 && (
          <View style={styles.recentSearches}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("routes.recentSearches")}
            </Text>
            {recentSearches.map((search, index) => (
              <Chip
                key={index}
                onPress={() => setEndPoint(search)}
                style={styles.recentSearchChip}
                icon="history"
              >
                {search.description}
              </Chip>
            ))}
          </View>
        )}

      {/* Bouton de calcul d'itinéraire */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleCalculateRoute}
          disabled={!startPoint || !endPoint || isCalculating}
          loading={isCalculating}
          style={[styles.calculateButton, { backgroundColor: colors.primary }]}
        >
          {t("routes.calculate")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputsContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    position: "relative",
  },
  clearButton: {
    position: "absolute",
    right: 0,
    top: 5,
  },
  actionButton: {
    marginLeft: 8,
  },
  swapButton: {
    alignSelf: "center",
    marginVertical: -6,
  },
  transportOptions: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  transportScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  transportChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  recentSearches: {
    marginBottom: 16,
  },
  recentSearchChip: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: "auto",
  },
  calculateButton: {
    padding: 8,
  },
});
