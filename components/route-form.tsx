"use client";

import { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  IconButton,
  Checkbox,
} from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { X } from "lucide-react-native";
import {
  useCreateRouteMutation,
  useCalculateRouteMutation,
  type CreateRouteRequest,
} from "@/store/api";

interface RouteFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  currentLocation?: { latitude: number; longitude: number } | null;
}

export default function RouteFormModal({
  visible,
  onClose,
  onSuccess,
  userId,
  currentLocation,
}: RouteFormModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Form state
  const [startLat, setStartLat] = useState(
    currentLocation?.latitude?.toString() || ""
  );
  const [startLon, setStartLon] = useState(
    currentLocation?.longitude?.toString() || ""
  );
  const [endLat, setEndLat] = useState("");
  const [endLon, setEndLon] = useState("");
  const [transportMode, setTransportMode] = useState("car");
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedRoute, setCalculatedRoute] = useState<string | null>(null);

  // RTK Query hooks
  const [calculateRoute, { isLoading: isCreating }] =
    useCalculateRouteMutation();
  // const { refetch: calculateRoute, isFetching: isCalculatingRoute } =
  //   useCalculateRouteMutation(
  //     {
  //       startLat: Number.parseFloat(startLat) || 0,
  //       startLon: Number.parseFloat(startLon) || 0,
  //       endLat: Number.parseFloat(endLat) || 0,
  //       endLon: Number.parseFloat(endLon) || 0,
  //       transportMode,
  //       avoidTolls,
  //     },
  //     { skip: true }
  //   );

  // Transport mode options
  const transportModes = [
    { value: "auto", label: t("map.car") },
    { value: "bicycle", label: t("map.bicycle") },
    { value: "pedestrian", label: t("map.walking") },
  ];

  const handleCalculateRoute = async () => {
    if (!startLat || !startLon || !endLat || !endLon) {
      return;
    }

    setIsCalculating(true);
    try {
      // const result = await calculateRoute();
      // if (result.data) {
      //   setCalculatedRoute(result.data);
      // }
    } catch (error) {
      console.error("Error calculating route:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!calculatedRoute) {
      return;
    }

    try {
      const newRoute: CreateRouteRequest = {
        startLatitude: Number.parseFloat(startLat),
        startLongitude: Number.parseFloat(startLon),
        endLatitude: Number.parseFloat(endLat),
        endLongitude: Number.parseFloat(endLon),
        transportMode,
        avoidTolls,
        // routeData: calculatedRoute,
      };

      await calculateRoute(newRoute).unwrap();
      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error saving route:", error);
    }
  };

  const resetForm = () => {
    if (currentLocation) {
      setStartLat(currentLocation.latitude.toString());
      setStartLon(currentLocation.longitude.toString());
    } else {
      setStartLat("");
      setStartLon("");
    }
    setEndLat("");
    setEndLon("");
    setTransportMode("car");
    setAvoidTolls(false);
    setCalculatedRoute(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = startLat && startLon && endLat && endLon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("routes.createNew")}
            </Text>
            <IconButton
              icon={() => <X size={24} color={colors.text} />}
              onPress={handleClose}
            />
          </View>

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("routes.startPoint")}
            </Text>
            <View style={styles.coordinatesContainer}>
              <TextInput
                label={t("routes.latitude")}
                value={startLat}
                onChangeText={setStartLat}
                style={[styles.input, styles.coordinateInput]}
                mode="outlined"
                keyboardType="numeric"
              />
              <TextInput
                label={t("routes.longitude")}
                value={startLon}
                onChangeText={setStartLon}
                style={[styles.input, styles.coordinateInput]}
                mode="outlined"
                keyboardType="numeric"
              />
            </View>

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginTop: 16 },
              ]}
            >
              {t("routes.endPoint")}
            </Text>
            <View style={styles.coordinatesContainer}>
              <TextInput
                label={t("routes.latitude")}
                value={endLat}
                onChangeText={setEndLat}
                style={[styles.input, styles.coordinateInput]}
                mode="outlined"
                keyboardType="numeric"
              />
              <TextInput
                label={t("routes.longitude")}
                value={endLon}
                onChangeText={setEndLon}
                style={[styles.input, styles.coordinateInput]}
                mode="outlined"
                keyboardType="numeric"
              />
            </View>

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginTop: 16 },
              ]}
            >
              {t("routes.transportMode")}
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setTransportMode(value)}
              value={transportMode}
            >
              {transportModes.map((mode) => (
                <View key={mode.value} style={styles.radioItem}>
                  <RadioButton value={mode.value} color={colors.primary} />
                  <Text style={{ color: colors.text }}>{mode.label}</Text>
                </View>
              ))}
            </RadioButton.Group>

            <View style={styles.checkboxContainer}>
              <Checkbox.Item
                label={t("routes.avoidTolls")}
                status={avoidTolls ? "checked" : "unchecked"}
                onPress={() => setAvoidTolls(!avoidTolls)}
                color={colors.primary}
              />
            </View>

            {calculatedRoute && (
              <View style={styles.calculatedRouteContainer}>
                <Text
                  style={[
                    styles.calculatedRouteTitle,
                    { color: colors.primary },
                  ]}
                >
                  {t("routes.routeCalculated")}
                </Text>
              </View>
            )}
            <View style={styles.buttonContainer}>
              {!calculatedRoute ? (
                <Button
                  mode="contained"
                  onPress={handleSaveRoute}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  // loading={isCalculating || isCalculatingRoute}
                  // disabled={!isFormValid || isCalculating || isCalculatingRoute}
                >
                  {t("routes.calculate")}
                </Button>
              ) : (
                <View style={styles.buttonRow}>
                  <Button
                    mode="outlined"
                    onPress={() => setCalculatedRoute(null)}
                    style={[styles.button, styles.resetButton]}
                    labelStyle={{ color: colors.text }}
                  >
                    {t("routes.recalculate")}
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveRoute}
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    loading={isCreating}
                    disabled={isCreating}
                  >
                    {t("routes.save")}
                  </Button>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  formContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  coordinatesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    marginBottom: 10,
  },
  coordinateInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  checkboxContainer: {
    marginTop: 10,
  },
  calculatedRouteContainer: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  calculatedRouteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  resetButton: {
    borderWidth: 1,
  },
});
