"use client";

import { useState, useEffect } from "react";
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
  Switch,
} from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { X } from "lucide-react-native";
import type { Ping } from "@/store/api";

interface EditPingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pingId: number, updatedPing: Partial<Ping>) => void;
  ping: Ping | null;
}

export default function EditPingModal({
  visible,
  onClose,
  onSubmit,
  ping,
}: EditPingModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Form state
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with ping data when it changes
  useEffect(() => {
    if (ping) {
      setType(ping.type);
      setDescription(ping.description);
      setIsActive(ping.isActive);
    }
  }, [ping]);

  // Available ping types
  const pingTypes = [
    { value: "bouchon", label: t("pings.types.bouchon") },
    { value: "accident", label: t("pings.types.accident") },
    { value: "nid_de_poule", label: t("pings.types.nid_de_poule") },
    // { value: "shopping", label: t("pings.types.shopping") },
    // { value: "transport", label: t("pings.types.transport") },
    // { value: "social", label: t("pings.types.social") },
  ];

  const handleSubmit = () => {
    if (!ping) {
      return;
    }

    setIsSubmitting(true);

    const updatedPing: Partial<Ping> = {
      type: type,
      description: description,
      isActive: isActive,
    };

    onSubmit(ping.id, updatedPing);
    setIsSubmitting(false);
  };

  if (!ping) return null;

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
              {t("pings.editPing")}
            </Text>
            <IconButton
              icon={() => <X size={24} color={colors.text} />}
              onPress={onClose}
            />
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("pings.selectType")}
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setType(value)}
              value={type}
            >
              {pingTypes.map((pingType) => (
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
              {t("pings.description")}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder={t("pings.descriptionPlaceholder")}
              style={styles.descriptionInput}
            />

            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>
                {t("pings.isActive")}
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                color={colors.primary}
              />
            </View>

            <Text style={[styles.locationText, { color: colors.text }]}>
              {t("pings.locationInfo")}
              {ping.latitude.toFixed(6)}, {ping.longitude.toFixed(6)}
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
              disabled={!description || isSubmitting}
            >
              {t("pings.update")}
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
    paddingTop: 16,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  switchLabel: {
    fontSize: 16,
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
