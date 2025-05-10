"use client";

import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  Button,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { logout } from "@/store/slices/auth-slice";
import { useRouter } from "expo-router";
import {
  Camera,
  Edit,
  LogOut,
  Moon,
  Globe,
  ChevronRight,
  Bell,
  Settings,
  MapPin,
  List,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import EditProfileSheet from "@/components/edit-profile-sheet";
import UserPreferencesSheet from "@/components/user-preferences-sheet";
import {
  useUpdateUserPreferencesMutation,
  useGetRoutesByUserQuery,
  type Route,
  useGetUserByIdQuery,
} from "@/store/api";

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, changeLanguage, language } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();

  // Récupérer l'utilisateur depuis le store Redux
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // RTK Query hooks
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useGetUserByIdQuery(Number(authUser?.id));
  const [updatePreferences, { isLoading: isUpdatingPreferences }] =
    useUpdateUserPreferencesMutation();

  // Get user routes
  const {
    data: userRoutes,
    isLoading: isLoadingRoutes,
    refetch: refetchRoutes,
  } = useGetRoutesByUserQuery(
    { userId: userProfile?.id || 0 },
    { skip: !userProfile?.id }
  );

  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Récupérer le profil utilisateur au chargement
  useEffect(() => {
    if (isAuthenticated) {
      refetchProfile();
    }
  }, [isAuthenticated, refetchProfile]);

  // Récupérer les routes de l'utilisateur quand le profil est chargé
  useEffect(() => {
    if (userProfile?.id) {
      refetchRoutes();
    }
  }, [userProfile, refetchRoutes]);

  const handleLogout = () => {
    Alert.alert(
      t("profile.logoutConfirmTitle"),
      t("profile.logoutConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("profile.logout"),
          onPress: () => {
            dispatch(logout());
            router.replace("/auth/login");
          },
          style: "destructive",
        },
      ]
    );
  };

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
      // Ici, vous pourriez implémenter une logique pour télécharger l'image sur votre serveur
      // puis mettre à jour l'avatar de l'utilisateur
      Alert.alert(
        t("profile.avatarUpdateTitle"),
        t("profile.avatarUpdateMessage"),
        [{ text: t("common.ok") }]
      );
    }
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    setShowLanguageOptions(false);
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const navigateToRoutesList = () => {
    router.push("/home/routes");
  };

  // Si le profil est en cours de chargement
  if (isLoadingProfile) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>
          {t("profile.loading")}
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={100}
              source={
                authUser?.avatar
                  ? { uri: authUser.avatar }
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

          <Text style={[styles.userName, { color: colors.text }]}>
            {userProfile?.userName ||
              authUser?.userName ||
              t("profile.defaultName")}
          </Text>
          <Text style={[styles.userEmail, { color: colors.text }]}>
            {userProfile?.email || authUser?.email || "user@example.com"}
          </Text>

          <Button
            mode="outlined"
            icon={() => <Edit size={16} color={colors.primary} />}
            style={styles.editProfileButton}
            onPress={() => setShowEditProfile(true)}
          >
            {t("profile.editProfile")}
          </Button>
        </View>

        <Divider style={styles.divider} />

        {/* Recent Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("profile.recentRoutes")}
            </Text>
            <TouchableOpacity onPress={navigateToRoutesList}>
              <Text style={{ color: colors.primary }}>
                {t("profile.viewAll")}
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingRoutes ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.loadingIndicator}
            />
          ) : userRoutes && userRoutes.length > 0 ? (
            <View style={styles.routesContainer}>
              {userRoutes.slice(0, 3).map((route: Route) => (
                <Card key={route.id} style={styles.routeCard} mode="outlined">
                  <Card.Content>
                    <View style={styles.routeHeader}>
                      <MapPin size={16} color={colors.primary} />
                      <Text style={[styles.routeTitle, { color: colors.text }]}>
                        {t("routes.from")} ({route.startLatitude.toFixed(2)},{" "}
                        {route.startLongitude.toFixed(2)})
                      </Text>
                    </View>
                    <View style={styles.routeHeader}>
                      <MapPin size={16} color={colors.error} />
                      <Text style={[styles.routeTitle, { color: colors.text }]}>
                        {t("routes.to")} ({route.endLatitude.toFixed(2)},{" "}
                        {route.endLongitude.toFixed(2)})
                      </Text>
                    </View>
                    <View style={styles.routeDetails}>
                      <Text style={[styles.routeDate, { color: colors.text }]}>
                        {formatDate(route.createdAt)} • {route.transportMode}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          ) : (
            <View style={styles.emptyRoutes}>
              <Text style={{ color: colors.text, textAlign: "center" }}>
                {t("profile.noRoutes")}
              </Text>
              <Button
                mode="outlined"
                onPress={navigateToRoutesList}
                style={{ marginTop: 8 }}
                icon={() => <MapPin size={16} color={colors.primary} />}
              >
                {t("profile.createRoute")}
              </Button>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("profile.settings")}
          </Text>

          {/* Preferences */}
          {/* <Card
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setShowPreferences(true)}
            >
              <View style={styles.settingIconContainer}>
                <Settings size={22} color={colors.primary} />
              </View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                {t("profile.preferences")}
              </Text>
              <ChevronRight size={18} color={colors.text} />
            </TouchableOpacity>
          </Card> */}

          {/* Theme Toggle */}
          <Card
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingIconContainer}>
                <Moon size={22} color={colors.primary} />
              </View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                {t("profile.darkMode")}
              </Text>
              <View style={styles.switchContainer}>
                <View
                  style={[
                    styles.switchTrack,
                    {
                      backgroundColor: isDark
                        ? colors.primary
                        : colors.surfaceVariant,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.switchThumb,
                      {
                        backgroundColor: colors.background,
                        transform: [{ translateX: isDark ? 20 : 0 }],
                      },
                    ]}
                    onPress={handleToggleTheme}
                  />
                </View>
              </View>
            </View>
          </Card>

          {/* Language */}
          <Card
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setShowLanguageOptions(!showLanguageOptions)}
            >
              <View style={styles.settingIconContainer}>
                <Globe size={22} color={colors.primary} />
              </View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                {t("profile.language")}
              </Text>
              <View style={styles.languageValue}>
                <Text style={{ color: colors.text }}>
                  {language === "fr" ? "Français" : "English"}
                </Text>
                <ChevronRight size={18} color={colors.text} />
              </View>
            </TouchableOpacity>

            {showLanguageOptions && (
              <View style={styles.languageOptions}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleLanguageChange("en")}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      language === "en" && { borderColor: colors.primary },
                    ]}
                  >
                    {language === "en" && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={{ color: colors.text }}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleLanguageChange("fr")}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      language === "fr" && { borderColor: colors.primary },
                    ]}
                  >
                    {language === "fr" && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={{ color: colors.text }}>Français</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Notifications */}
          {/* <Card
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push("/home/notifications")}
            >
              <View style={styles.settingIconContainer}>
                <Bell size={22} color={colors.primary} />
              </View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                {t("profile.notifications")}
              </Text>
              <ChevronRight size={18} color={colors.text} />
            </TouchableOpacity>
          </Card> */}

          {/* Routes List */}
          <Card
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              style={styles.settingRow}
              onPress={navigateToRoutesList}
            >
              <View style={styles.settingIconContainer}>
                <List size={22} color={colors.primary} />
              </View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                {t("profile.allRoutes")}
              </Text>
              <ChevronRight size={18} color={colors.text} />
            </TouchableOpacity>
          </Card>

          {/* Logout */}
          <Button
            mode="contained"
            icon={() => <LogOut size={16} color={colors.onPrimary} />}
            style={[styles.logoutButton, { backgroundColor: colors.primary }]}
            onPress={handleLogout}
          >
            {t("profile.logout")}
          </Button>
        </View>
      </ScrollView>

      {/* Edit Profile Bottom Sheet */}
      <EditProfileSheet
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={userProfile || authUser}
        onRefresh={refetchProfile}
      />

      {/* User Preferences Bottom Sheet */}
      {/* <UserPreferencesSheet
        visible={showPreferences}
        onClose={() => setShowPreferences(false)}
        userId={userProfile?.id || 0}
        preferences={null} // Vous devrez récupérer les préférences utilisateur depuis l'API
        onRefresh={refetchProfile}
      /> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
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
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
    opacity: 0.7,
  },
  userRole: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
    fontStyle: "italic",
  },
  editProfileButton: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  routesContainer: {
    marginBottom: 8,
  },
  routeCard: {
    marginBottom: 12,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  routeTitle: {
    fontSize: 14,
    marginLeft: 8,
  },
  routeDetails: {
    marginTop: 8,
  },
  routeDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyRoutes: {
    padding: 20,
    alignItems: "center",
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingCard: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  settingIconContainer: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  switchContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 5,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  languageValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageOptions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  logoutButton: {
    marginTop: 24,
  },
});
