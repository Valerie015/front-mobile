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
} from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { X } from "lucide-react-native";
import type { CreateIncidentRequest } from "@/store/api";

interface CreatePingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (ping: CreateIncidentRequest) => void;
  currentLocation: { latitude: number; longitude: number } | null;
}

export default function CreatePingModal({
  visible,
  onClose,
  onSubmit,
  currentLocation,
}: // userId,
CreatePingModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Form state
  const [type, setType] = useState("info");
  const [description, setDescription] = useState("");
  const [expectedDuration, setExpectedDuration] = useState<number | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available ping types
  const incidentTypes = [
    { value: "accident", label: t("incidents.types.accident") },
    { value: "construction", label: t("incidents.types.construction") },
    { value: "police", label: t("incidents.types.police") },
    { value: "hazard", label: t("incidents.types.hazard") },
    { value: "closure", label: t("incidents.types.closure") },
    { value: "traffic_jam", label: t("incidents.types.trafficJam") },
  ];

  const handleSubmit = () => {
    if (!currentLocation) {
      return;
    }

    setIsSubmitting(true);

    const newPing: CreateIncidentRequest = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      type: type,
      description: description,
      expectedDuration,
    };

    onSubmit(newPing);
    resetForm();
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setType("accident");
    setDescription("");
    setExpectedDuration(undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
              {t("incidents.createNew")}
            </Text>
            <IconButton
              icon={() => <X size={24} color={colors.text} />}
              onPress={onClose}
            />
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("incidents.selectType")}
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setType(value)}
              value={type}
            >
              {incidentTypes.map((pingType) => (
                <View key={pingType.value} style={styles.radioItem}>
                  <RadioButton value={pingType.value} color={colors.primary} />
                  <Text style={{ color: colors.text }}>{pingType.label}</Text>
                </View>
              ))}
            </RadioButton.Group>

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginTop: 16 },
              ]}
            >
              {t("incidents.description")}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder={t("incidents.descriptionPlaceholder")}
              style={styles.descriptionInput}
            />

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginTop: 16 },
              ]}
            >
              {t("incidents.expectedDuration")}
            </Text>
            <TextInput
              value={expectedDuration?.toString() || ""}
              onChangeText={(v) =>
                setExpectedDuration(v ? parseInt(v, 10) : undefined)
              }
              mode="outlined"
              keyboardType="numeric"
              placeholder={t("incidents.expectedDurationPlaceholder")}
              style={styles.expectedDurationInput}
            />

            <Text style={[styles.locationText, { color: colors.text }]}>
              {t("pings.locationInfo")}
              {currentLocation
                ? `${currentLocation.latitude.toFixed(
                    6
                  )}, ${currentLocation.longitude.toFixed(6)}`
                : t("pings.locationUnavailable")}
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
              labelStyle={{ color: colors.text }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[
                styles.button,
                styles.submitButton,
                { backgroundColor: colors.primary },
              ]}
              loading={isSubmitting}
              disabled={!description || !currentLocation || isSubmitting}
            >
              {t("pings.create")}
            </Button>
          </View>
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
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  descriptionInput: {
    marginBottom: 16,
    paddingTop: 15,
  },
  expectedDurationInput: {
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    borderWidth: 0,
  },
});
