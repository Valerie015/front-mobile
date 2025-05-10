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
  Keyboard,
  Pressable,
  Alert,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Avatar,
  Divider,
  Switch,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { Camera, X, Save } from "lucide-react-native";
import {
  useUpdateUserMutation,
  useUpdateUserPreferencesMutation,
  type User,
} from "@/store/api";

const { height } = Dimensions.get("window");

type EditProfileSheetProps = {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  onRefresh: () => void;
};

export default function EditProfileSheet({
  visible,
  onClose,
  user,
  onRefresh,
}: EditProfileSheetProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // RTK Query hooks
  const [updateUserApi, { isLoading: isUpdatingUser }] =
    useUpdateUserMutation();
  const [updateUserPreferences, { isLoading: isUpdatingPreferences }] =
    useUpdateUserPreferencesMutation();

  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Form validation schema
  const schema = yup.object({
    userName: yup.string().required(t("profile.edit.nameRequired")),
    email: yup
      .string()
      .email(t("profile.edit.emailInvalid"))
      .required(t("profile.edit.emailRequired")),
    phone: yup.string().nullable(),
    bio: yup.string().nullable(),
  });

  type FormData = {
    userName: string;
    email: string;
    phone?: string | null;
    bio?: string | null;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      userName: user?.userName || "",
      email: user?.email || "",
      phone: "",
      bio: "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        userName: user.userName || "",
        email: user.email || "",
        phone: "",
        bio: "",
      });
    }
  }, [user, reset]);

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

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert(t("profile.cameraPermissionDenied"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: FormData) => {
    Keyboard.dismiss();

    if (!user || !user.id) {
      Alert.alert(t("profile.edit.error"), t("profile.edit.userNotFound"), [
        { text: t("common.ok") },
      ]);
      return;
    }

    try {
      // Mettre à jour les informations de l'utilisateur
      await updateUserApi({
        id: user.id,
        userData: {
          userName: data.userName,
          email: data.email,
        },
      }).unwrap();

      // Mettre à jour les préférences utilisateur
      // Cette partie dépendra de votre API

      // Rafraîchir les données du profil
      onRefresh();

      // Fermer la modal
      onClose();

      // Afficher un message de succès
      Alert.alert(t("profile.edit.success"), t("profile.edit.successMessage"), [
        { text: t("common.ok") },
      ]);
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert(t("profile.edit.error"), t("profile.edit.errorMessage"), [
        { text: t("common.ok") },
      ]);
    }
  };

  const handleClose = () => {
    // Dismiss keyboard if it's open
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Backdrop */}
        <Pressable style={[styles.backdrop]} onPress={handleClose}>
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
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("profile.edit.title")}
          </Text>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Avatar.Image
                  size={100}
                  source={
                    avatarUri
                      ? { uri: avatarUri }
                      : require("@/assets/images/avatar.jpg")
                  }
                />
                <TouchableOpacity
                  style={[
                    styles.editAvatarButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handlePickImage}
                >
                  <Camera size={16} color={colors.onPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                {t("profile.edit.changePhoto")}
              </Text>
            </View>

            <Divider style={styles.divider} />

            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("profile.edit.personalInfo")}
              </Text>

              <Controller
                control={control}
                name="userName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t("profile.edit.nameLabel")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={[styles.input, { backgroundColor: colors.surface }]}
                    mode="outlined"
                    error={!!errors.userName}
                    left={<TextInput.Icon icon="account" />}
                  />
                )}
              />
              {errors.userName && (
                <Text style={styles.errorText}>{errors.userName.message}</Text>
              )}

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t("profile.edit.emailLabel")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={[styles.input, { backgroundColor: colors.surface }]}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!!errors.email}
                    left={<TextInput.Icon icon="email" />}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t("profile.edit.phoneLabel")}
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={[styles.input, { backgroundColor: colors.surface }]}
                    mode="outlined"
                    keyboardType="phone-pad"
                    left={<TextInput.Icon icon="phone" />}
                  />
                )}
              />

              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t("profile.edit.bioLabel")}
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={[
                      styles.input,
                      styles.bioInput,
                      { backgroundColor: colors.surface },
                    ]}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    left={<TextInput.Icon icon="text" />}
                  />
                )}
              />
            </View>

            <Divider style={styles.divider} />

            {/* Notification Preferences */}
            <View style={styles.notificationSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("profile.edit.notificationPreferences")}
              </Text>

              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTextContainer}>
                  <Text
                    style={[styles.preferenceTitle, { color: colors.text }]}
                  >
                    {t("profile.edit.emailNotifications")}
                  </Text>
                  <Text
                    style={[
                      styles.preferenceDescription,
                      { color: colors.text },
                    ]}
                  >
                    {t("profile.edit.emailNotificationsDesc")}
                  </Text>
                </View>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  color={colors.primary}
                />
              </View>

              <View style={styles.preferenceRow}>
                <View style={styles.preferenceTextContainer}>
                  <Text
                    style={[styles.preferenceTitle, { color: colors.text }]}
                  >
                    {t("profile.edit.pushNotifications")}
                  </Text>
                  <Text
                    style={[
                      styles.preferenceDescription,
                      { color: colors.text },
                    ]}
                  >
                    {t("profile.edit.pushNotificationsDesc")}
                  </Text>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  color={colors.primary}
                />
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              labelStyle={{ color: colors.onPrimary }}
              loading={isUpdatingUser || isUpdatingPreferences}
              disabled={isUpdatingUser || isUpdatingPreferences}
              icon={() => <Save size={18} color={colors.onPrimary} />}
            >
              {t("profile.edit.saveChanges")}
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
    height: "90%",
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
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  bioInput: {
    height: 100,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 8,
  },
  notificationSection: {
    marginBottom: 24,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  preferenceTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  saveButton: {
    paddingVertical: 8,
  },
});
