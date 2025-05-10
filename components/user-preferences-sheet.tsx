"use client";

import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
  Animated,
  Pressable,
  Alert,
} from "react-native";
import { Text, RadioButton, Button, Divider, Switch } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { X, Save } from "lucide-react-native";
import {
  useUpdateUserPreferencesMutation,
  type UserPreferences,
} from "@/store/api";

const { height } = Dimensions.get("window");

type UserPreferencesSheetProps = {
  visible: boolean;
  onClose: () => void;
  userId: number;
  preferences: UserPreferences | null;
  onRefresh: () => void;
};

export default function UserPreferencesSheet({
  visible,
  onClose,
  userId,
  preferences,
  onRefresh,
}: UserPreferencesSheetProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Preferences state
  const [transportMode, setTransportMode] = useState<string>("car");
  const [avoidTolls, setAvoidTolls] = useState<boolean>(false);
  const [avoidHighways, setAvoidHighways] = useState<boolean>(false);
  const [distanceUnit, setDistanceUnit] = useState<string>("km");

  // RTK Query hooks
  const [updatePreferences, { isLoading }] = useUpdateUserPreferencesMutation();

  // Initialize form with preferences data when it changes
  useEffect(() => {
    if (preferences) {
      setTransportMode(preferences.defaultTransportMode || "car");
      setAvoidTolls(preferences.avoidTolls || false);
      setAvoidHighways(preferences.avoidHighways || false);
      setDistanceUnit(preferences.distanceUnit || "km");
    }
  }, [preferences]);

  // Handle animations when visibility changes
  useEffect(() => {
    if (visible) {
      // Show the bottom sheet
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide the bottom sheet
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  const handleSave = async () => {
    if (!userId) {
      Alert.alert(t("preferences.error"), t("preferences.userNotFound"), [
        { text: t("common.ok") },
      ]);
      return;
    }

    try {
      await updatePreferences({
        id: userId,
        preferences: {
          defaultTransportMode: transportMode,
          avoidTolls,
          avoidHighways,
          distanceUnit,
        },
      }).unwrap();

      // Refresh user data
      onRefresh();

      // Close the sheet
      onClose();

      // Show success message
      Alert.alert(t("preferences.success"), t("preferences.successMessage"), [
        { text: t("common.ok") },
      ]);
    } catch (error) {
      console.error("Update preferences error:", error);
      Alert.alert(t("preferences.error"), t("preferences.errorMessage"), [
        { text: t("common.ok") },
      ]);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Backdrop */}
        <Pressable style={[styles.backdrop]} onPress={onClose}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "black", opacity: backdropOpacity },
            ]}
          />
        </Pressable>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle and close button */}
          <View style={styles.header}>
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.text, opacity: 0.2 },
              ]}
            />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("preferences.title")}
          </Text>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Transport Mode */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("preferences.transportMode")}
              </Text>
              <RadioButton.Group
                onValueChange={(value) => setTransportMode(value)}
                value={transportMode}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="car" color={colors.primary} />
                  <Text style={[styles.radioLabel, { color: colors.text }]}>
                    {t("map.car")}
                  </Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="bicycle" color={colors.primary} />
                  <Text style={[styles.radioLabel, { color: colors.text }]}>
                    {t("map.bicycle")}
                  </Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="walking" color={colors.primary} />
                  <Text style={[styles.radioLabel, { color: colors.text }]}>
                    {t("map.walking")}
                  </Text>
                </View>
              </RadioButton.Group>
            </View>

            <Divider style={styles.divider} />

            {/* Route Options */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("preferences.routeOptions")}
              </Text>

              <View style={styles.switchOption}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  {t("preferences.avoidTolls")}
                </Text>
                <Switch
                  value={avoidTolls}
                  onValueChange={setAvoidTolls}
                  color={colors.primary}
                />
              </View>

              <View style={styles.switchOption}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  {t("preferences.avoidHighways")}
                </Text>
                <Switch
                  value={avoidHighways}
                  onValueChange={setAvoidHighways}
                  color={colors.primary}
                />
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Distance Unit */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("preferences.distanceUnit")}
              </Text>
              <RadioButton.Group
                onValueChange={(value) => setDistanceUnit(value)}
                value={distanceUnit}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="km" color={colors.primary} />
                  <Text style={[styles.radioLabel, { color: colors.text }]}>
                    {t("preferences.kilometers")}
                  </Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="mi" color={colors.primary} />
                  <Text style={[styles.radioLabel, { color: colors.text }]}>
                    {t("preferences.miles")}
                  </Text>
                </View>
              </RadioButton.Group>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              labelStyle={{ color: colors.onPrimary }}
              loading={isLoading}
              disabled={isLoading}
              icon={() => <Save size={18} color={colors.onPrimary} />}
            >
              {t("preferences.saveChanges")}
            </Button>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 8,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  switchOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  saveButton: {
    paddingVertical: 8,
  },
});
