"use client";

import { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, Checkbox, Button, IconButton } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { X } from "lucide-react-native";

export interface IncidentFilters {
  types: string[];
  radiusKm: number;
}

interface IncidentFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: IncidentFilters) => void;
  initialFilters: IncidentFilters;
  // currentUserId?: number;
}

export default function PingFilterModal({
  visible,
  onClose,
  onApplyFilters,
  initialFilters,
}: // currentUserId,
IncidentFilterModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    initialFilters.types
  );
  const [radiusKm, setRadiusKm] = useState(initialFilters.radiusKm);
  // const [activeOnly, setActiveOnly] = useState(initialFilters.activeOnly);

  // Available incident types
  const incidentTypes = [
    { value: "accident", label: t("incidents.types.accident") },
    { value: "construction", label: t("incidents.types.construction") },
    { value: "police", label: t("incidents.types.police") },
    { value: "hazard", label: t("incidents.types.hazard") },
    { value: "closure", label: t("incidents.types.closure") },
    { value: "traffic_jam", label: t("incidents.types.trafficJam") },
  ];

  // Predefined radius options
  const radiusOptions = [
    { value: 1, label: "1 km" },
    { value: 2, label: "2 km" },
    { value: 5, label: "5 km" },
    { value: 10, label: "10 km" },
    { value: 20, label: "20 km" },
    { value: 50, label: "50 km" },
  ];

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      types: selectedTypes,
      radiusKm: radiusKm,
      // activeOnly: activeOnly,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setRadiusKm(5);
    // setActiveOnly(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("incidents.filterTitle")}
            </Text>
            <IconButton
              icon={() => <X size={24} color={colors.text} />}
              onPress={onClose}
            />
          </View>

          <ScrollView style={styles.filtersContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("incidents.filterByType")}
            </Text>
            {incidentTypes.map((type) => (
              <Checkbox.Item
                key={type.value}
                label={type.label}
                status={
                  selectedTypes.includes(type.value) ? "checked" : "unchecked"
                }
                onPress={() => toggleType(type.value)}
                color={colors.primary}
              />
            ))}

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginTop: 16 },
              ]}
            >
              {t("incidents.filterByRadius")}
            </Text>

            {/* Radius selection buttons */}
            <View style={styles.radiusButtonsContainer}>
              {radiusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radiusButton,
                    radiusKm === option.value && {
                      backgroundColor: colors.primaryContainer,
                    },
                    { borderColor: colors.primary },
                  ]}
                  onPress={() => setRadiusKm(option.value)}
                >
                  <Text
                    style={[
                      styles.radiusButtonText,
                      {
                        color:
                          radiusKm === option.value
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* <View style={styles.checkboxContainer}>
              <Checkbox.Item
                label={t("incidents.activeOnly")}
                status={activeOnly ? "checked" : "unchecked"}
                onPress={() => setActiveOnly(!activeOnly)}
                color={colors.primary}
              />
            </View> */}

            {/* {currentUserId && (
              <View style={styles.checkboxContainer}>
                <Checkbox.Item
                  label={t("pings.showOnlyMine")}
                  status={showOnlyMine ? "checked" : "unchecked"}
                  onPress={() => setShowOnlyMine(!showOnlyMine)}
                  color={colors.primary}
                />
              </View>
            )} */}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={[styles.button, styles.resetButton]}
              labelStyle={{ color: colors.text }}
            >
              {t("pings.resetFilters")}
            </Button>
            <Button
              mode="contained"
              onPress={handleApplyFilters}
              style={[
                styles.button,
                styles.applyButton,
                { backgroundColor: colors.primary },
              ]}
            >
              {t("pings.applyFilters")}
            </Button>
          </View>
        </View>
      </View>
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
  filtersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  radiusButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  radiusButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  radiusButtonText: {
    fontSize: 14,
  },
  checkboxContainer: {
    marginTop: 10,
  },
  buttonContainer: {
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
  applyButton: {
    borderWidth: 0,
  },
});
