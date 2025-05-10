"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define translations
const translations = {
  en: {
    routeMap: {
      options: "Route Options",
      summary: "Summary",
      transportMode: "Transport Mode",
      avoidTolls: "Avoid Tolls",
      avoidHighways: "Avoid Highways",
      avoidFerries: "Avoid Ferries",
      units: "Units",
      language: "Language",
      totalDistance: "Total Distance",
      estimatedTime: "Estimated Time",
      start: "Start",
      end: "End",
      step: "Step",
      distance: "Distance",
      duration: "Duration",
      minutes: "minutes",
      transport: {
        car: "Car",
        bike: "Bicycle",
        walk: "On Foot",
        scooter: "Motorcycle",
      },
      unit: {
        kilometers: "Kilometers",
        miles: "Miles",
      },
      languages: {
        french: "French",
        english: "English",
        german: "German",
        spanish: "Spanish",
      },
      searchPlaceholder: "Search for a place",
      currentLocation: "Current Location",
      selectLocations: "Please select a start point and destination",
      reportIncident: "Report Incident",
      selectLocationType: "Set as:",
      setStart: "Starting Point",
      setEnd: "Destination",
      cancel: "Cancel",
      alternateRoutes: "Alternate Routes",
      route: "Route",
    },
    common: {
      edit: "Edit",
      next: "Next",
      skip: "Skip",
      back: "Back",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      loading: "Loading...",
      error: "An error occurred",
      success: "Success!",
      ok: "OK",
      retry: "Retry",
      yes: "Yes",
      no: "No",
    },
    onboarding: {
      slide1: {
        title: "Welcome to EasyGo",
        description:
          "Discover amazing features that will make your life easier",
      },
      slide2: {
        title: "Explore the Map",
        description:
          "Find locations and navigate with our optimized map interface",
      },
      slide3: {
        title: "Stay Connected",
        description: "Get real-time updates and notifications",
      },
      slide4: {
        title: "Ready to Start?",
        description: "Create an account or login to begin your journey",
      },
      getStarted: "Get Started",
    },
    auth: {
      login: {
        title: "Welcome Back",
        subtitle: "Sign in to your account",
        emailLabel: "Email",
        passwordLabel: "Password",
        forgotPassword: "Forgot Password?",
        signIn: "Sign In",
        noAccount: "Don't have an account?",
        signUp: "Sign Up",
        emailRequired: "Email is required",
        emailInvalid: "Enter a valid email",
        passwordRequired: "Password is required",
        passwordTooShort: "Password must be at least 6 characters",
        error: "Login Failed",
        errorMessage: "Invalid email or password. Please try again.",
      },
      register: {
        title: "Create Account",
        subtitle: "Sign up to get started",
        nameLabel: "Full Name",
        emailLabel: "Email",
        passwordLabel: "Password",
        confirmPasswordLabel: "Confirm Password",
        signUp: "Sign Up",
        haveAccount: "Already have an account?",
        signIn: "Sign In",
        success: "Registration Successful",
        successMessage:
          "Your account has been created successfully. You can now log in.",
        error: "Registration Failed",
        errorMessage:
          "There was a problem creating your account. Please try again.",
        nameRequired: "Name is required",
        emailRequired: "Email is required",
        emailInvalid: "Enter a valid email",
        passwordRequired: "Password is required",
        passwordTooShort: "Password must be at least 6 characters",
        passwordsNotMatch: "Passwords must match",
        confirmPasswordRequired: "Confirm password is required",
      },
    },
    map: {
      loading: "Loading map...",
      locationPermissionDenied: "Permission to access location was denied",
      locationError: "Failed to get location",
      searchPlaceholder: "Search here...",
      routePlanner: "Route Planner",
      selectStartPoint: "Select start point",
      selectEndPoint: "Select destination",
      car: "Car",
      bicycle: "Bicycle",
      walking: "Walking",
      waypoints: "Waypoints",
      distance: "Distance",
      duration: "Duration",
      directions: "Directions",
      showDirections: "Show Directions",
      hideDirections: "Hide Directions",
      addWaypoint: "Add Waypoint",
      clearRoute: "Clear Route",
      startPoint: "Start Point",
      endPoint: "End Point",
      waypoint: "Waypoint",
      currentLocation: "Current Location",
      tapToRemove: "Tap to remove",
      calculatingRoute: "Calculating route...",
      routeCalculationError: "Could not calculate route. Please try again.",
      startNavigation: "Start Navigation",
      noRouteToNavigate:
        "No route available for navigation. Please calculate a route first.",
      offRoute: "You are off the route. Recalculating...",
      searchError: "Error searching places",
      routeError: "Error fetching route",
      incidentDescription: "Incident Description",
      submitIncident: "Submit Incident",
      incidentIncomplete: "Please provide an incident description",
    },
    incidents: {
      createNew: "Report new incident",
      selectType: "Select incident type",
      description: "Description",
      descriptionPlaceholder: "Describe what happened…",
      expectedDuration: "Expected duration (min)",
      expectedDurationPlaceholder: "Enter duration in minutes (optional)",
      locationInfo: "Location:",
      locationUnavailable: "Location unavailable",
      create: "Create incident",
      createSuccess: "Incident reported successfully",
      createError: "Failed to report incident",
      filterTitle: "Filter incidents",
      filterByType: "By type",
      filterByRadius: "By radius",
      activeOnly: "Active incidents only",
      showOnlyMine: "Show only my incidents",
      resetFilters: "Reset filters",
      applyFilters: "Apply filters",
      filtersApplied: "Filters applied",
      types: {
        accident: "Accident",
        construction: "Construction",
        police: "Police",
        hazard: "Hazard",
        closure: "Closure",
        trafficJam: "Traffic Jam",
      },
    },
    pings: {
      activate: "Activate",
      deactivate: "Deactivate",
      activateSuccess: "Ping activated successfully",
      activateError: "Failed to activate ping",
      deactivateSuccess: "Ping deactivated successfully",
      deactivateError: "Failed to deactivate ping",
      createNew: "Create New Ping",
      selectType: "Select Ping Type",
      description: "Description",
      descriptionPlaceholder: "Enter a description for this ping...",
      locationInfo: "Location: ",
      locationUnavailable: "Location unavailable",
      create: "Create Ping",
      edit: "Edit",
      editPing: "Edit Ping",
      delete: "Delete",
      confirmDelete: "Confirm Delete",
      update: "Update",
      isActive: "Active",
      createdAt: "Created At",
      status: "Status",
      location: "Location",
      active: "Active",
      inactive: "Inactive",
      loading: "Loading ping details...",
      filterTitle: "Filter Pings",
      filterByType: "Filter by Type",
      filterByRadius: "Filter by Radius (km)",
      kilometers: "km",
      activeOnly: "Show Active Pings Only",
      showOnlyMine: "Show Only My Pings",
      resetFilters: "Reset Filters",
      applyFilters: "Apply Filters",
      filtersApplied: "Filters Applied",
      createSuccess: "Ping created successfully",
      createError: "Failed to create ping",
      updateSuccess: "Ping updated successfully",
      updateError: "Failed to update ping",
      deleteSuccess: "Ping deleted successfully",
      deleteError: "Failed to delete ping",
      fetchError: "Failed to fetch pings",
      types: {
        bouchon: "plug",
        accident: "accident",
        nid_de_poule: "pothole",
      },
    },
    profile: {
      defaultName: "User",
      editProfile: "Edit Profile",
      settings: "Settings",
      darkMode: "Dark Mode",
      language: "Language",
      notifications: "Notifications",
      logout: "Logout",
      logoutConfirmTitle: "Confirm Logout",
      logoutConfirmMessage: "Are you sure you want to log out?",
      cameraPermissionDenied: "Permission to access camera was denied",
      loading: "Loading profile...",
      avatarUpdateTitle: "Avatar Update",
      avatarUpdateMessage:
        "Avatar update functionality is not fully implemented yet.",
      preferences: "Preferences",
      recentRoutes: "Recent Routes",
      viewAll: "View All",
      noRoutes: "You don't have any saved routes yet",
      createRoute: "Create Route",
      allRoutes: "All Routes",
      roles: {
        admin: "Administrator",
        user: "User",
        moderator: "Moderator",
      },
      edit: {
        title: "Edit Profile",
        changePhoto: "Change Photo",
        personalInfo: "Personal Information",
        nameLabel: "Full Name",
        emailLabel: "Email",
        phoneLabel: "Phone Number",
        bioLabel: "Bio",
        nameRequired: "Name is required",
        emailRequired: "Email is required",
        emailInvalid: "Enter a valid email",
        saveChanges: "Save Changes",
        notificationPreferences: "Notification Preferences",
        emailNotifications: "Email Notifications",
        emailNotificationsDesc: "Receive updates and alerts via email",
        pushNotifications: "Push Notifications",
        pushNotificationsDesc:
          "Receive notifications in real-time on your device",
        success: "Profile Updated",
        successMessage: "Your profile has been updated successfully.",
        error: "Update Failed",
        errorMessage:
          "There was a problem updating your profile. Please try again.",
        userNotFound: "User information not found. Please try again.",
      },
    },
    notifications: {
      title: "Notifications",
      empty: "You don't have any notifications yet",
      loading: "Loading notifications...",
      refresh: "Refresh",
      markAllRead: "Mark all as read",
      clearAll: "Clear all",
      fetchError: "Failed to load notifications",
      tryAgain: "Try Again",
    },
    preferences: {
      title: "Navigation Preferences",
      transportMode: "Default Transport Mode",
      routeOptions: "Route Options",
      avoidTolls: "Avoid Tolls",
      avoidHighways: "Avoid Highways",
      distanceUnit: "Distance Unit",
      kilometers: "Kilometers (km)",
      miles: "Miles (mi)",
      saveChanges: "Save Preferences",
      success: "Preferences Updated",
      successMessage:
        "Your navigation preferences have been updated successfully.",
      error: "Update Failed",
      errorMessage:
        "There was a problem updating your preferences. Please try again.",
      userNotFound: "User information not found. Please try again.",
    },
    routes: {
      noTolls: "Avoid tolls",
      savedRoutes: "Saved Routes",
      new: "New",
      createRoute: "Create Route",
      noRoutes: "You don't have any saved routes yet",
      loading: "Loading routes...",
      fetchError: "Failed to load routes",
      from: "From",
      to: "To",
      avoidTolls: "Avoid Tolls",
      createNew: "Create New Route",
      startPoint: "Start Point",
      endPoint: "End Point",
      latitude: "Latitude",
      longitude: "Longitude",
      transportMode: "Transport Mode",
      calculate: "Calculate Route",
      save: "Save",
      recalculate: "Recalculate",
      routeCalculated: "Route calculated successfully",
      routeDetails: "Route Details",
      createdAt: "Created At",
      navigate: "Navigate",
      delete: "Delete",
      confirmDelete: "Confirm Delete",
      createSuccess: "Route created successfully",
      activeRoute: "Active Route",
    },
  },
  fr: {
    routeMap: {
      options: "Options d'itinéraire",
      summary: "Récapitulatif",
      transportMode: "Mode de transport",
      avoidTolls: "Éviter les péages",
      avoidHighways: "Éviter les autoroutes",
      avoidFerries: "Éviter les ferries",
      units: "Unités",
      language: "Langue",
      totalDistance: "Distance totale",
      estimatedTime: "Temps estimé",
      start: "Départ",
      end: "Arrivée",
      step: "Étape",
      distance: "Distance",
      duration: "Durée",
      minutes: "minutes",
      transport: {
        car: "Voiture",
        bike: "Vélo",
        walk: "À pied",
        scooter: "Moto",
      },
      unit: {
        kilometers: "Kilomètres",
        miles: "Miles",
      },
      languages: {
        french: "Français",
        english: "Anglais",
        german: "Allemand",
        spanish: "Espagnol",
      },
      searchPlaceholder: "Rechercher un lieu",
      currentLocation: "Position actuelle",
      selectLocations:
        "Veuillez sélectionner un point de départ et une destination",
      reportIncident: "Signaler un incident",
      selectLocationType: "Définir comme :",
      setStart: "Point de départ",
      setEnd: "Destination",
      cancel: "Annuler",
      alternateRoutes: "Itinéraires alternatifs",
      route: "Itinéraire",
    },
    common: {
      edit: "Modifier",
      next: "Suivant",
      skip: "Passer",
      back: "Retour",
      cancel: "Annuler",
      confirm: "Confirmer",
      save: "Enregistrer",
      delete: "Supprimer",
      loading: "Chargement...",
      error: "Une erreur est survenue",
      success: "Succès !",
      ok: "OK",
      retry: "Réessayer",
      yes: "Oui",
      no: "Non",
    },
    onboarding: {
      slide1: {
        title: "Bienvenue sur EasyGo",
        description:
          "Découvrez des fonctionnalités incroyables qui vous faciliteront la vie",
      },
      slide2: {
        title: "Explorez la Carte",
        description:
          "Trouvez des lieux et naviguez avec notre interface de carte optimisée",
      },
      slide3: {
        title: "Restez Connecté",
        description:
          "Recevez des mises à jour et des notifications en temps réel",
      },
      slide4: {
        title: "Prêt à Commencer ?",
        description:
          "Créez un compte ou connectez-vous pour commencer votre voyage",
      },
      getStarted: "Commencer",
    },
    auth: {
      login: {
        title: "Bon Retour",
        subtitle: "Connectez-vous à votre compte",
        emailLabel: "Email",
        passwordLabel: "Mot de passe",
        forgotPassword: "Mot de passe oublié ?",
        signIn: "Se Connecter",
        noAccount: "Vous n'avez pas de compte ?",
        signUp: "S'inscrire",
        emailRequired: "L'email est requis",
        emailInvalid: "Entrez un email valide",
        passwordRequired: "Le mot de passe est requis",
        passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
        error: "Échec de connexion",
        errorMessage: "Email ou mot de passe invalide. Veuillez réessayer.",
      },
      register: {
        title: "Créer un Compte",
        subtitle: "Inscrivez-vous pour commencer",
        nameLabel: "Nom complet",
        emailLabel: "Email",
        passwordLabel: "Mot de passe",
        confirmPasswordLabel: "Confirmer le mot de passe",
        signUp: "S'inscrire",
        haveAccount: "Vous avez déjà un compte ?",
        signIn: "Se Connecter",
        success: "Inscription Réussie",
        successMessage:
          "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        error: "Échec de l'inscription",
        errorMessage:
          "Un problème est survenu lors de la création de votre compte. Veuillez réessayer.",
        nameRequired: "Le nom est requis",
        emailRequired: "L'email est requis",
        emailInvalid: "Entrez un email valide",
        passwordRequired: "Le mot de passe est requis",
        passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
        passwordsNotMatch: "Les mots de passe ne correspondent pas",
        confirmPasswordRequired: "La confirmation du mot de passe est requise",
      },
    },
    map: {
      loading: "Chargement de la carte...",
      locationPermissionDenied:
        "L'autorisation d'accès à la localisation a été refusée",
      locationError: "Échec de l'obtention de la localisation",
      searchPlaceholder: "Rechercher ici...",
      routePlanner: "Planificateur d'itinéraire",
      selectStartPoint: "Sélectionner le point de départ",
      selectEndPoint: "Sélectionner la destination",
      car: "Voiture",
      bicycle: "Vélo",
      walking: "À pied",
      waypoints: "Points intermédiaires",
      distance: "Distance",
      duration: "Durée",
      directions: "Directions",
      showDirections: "Afficher les directions",
      hideDirections: "Masquer les directions",
      addWaypoint: "Ajouter un point",
      clearRoute: "Effacer l'itinéraire",
      startPoint: "Point de départ",
      endPoint: "Destination",
      waypoint: "Point intermédiaire",
      currentLocation: "Position actuelle",
      tapToRemove: "Appuyez pour supprimer",
      calculatingRoute: "Calcul de l'itinéraire...",
      routeCalculationError:
        "Impossible de calculer l'itinéraire. Veuillez réessayer.",
      startNavigation: "Démarrer la navigation",
      noRouteToNavigate:
        "Aucun itinéraire disponible pour la navigation. Veuillez d'abord calculer un itinéraire.",
      offRoute: "Vous êtes hors de l'itinéraire. Recalcul en cours...",
      searchError: "Erreur lors de la recherche de lieux",
      routeError: "Erreur lors de la récupération de l'itinéraire",
      incidentDescription: "Description de l'incident",
      submitIncident: "Soumettre l'incident",
      incidentIncomplete: "Veuillez fournir une description de l'incident",
    },
    incidents: {
      createNew: "Signaler un incident",
      selectType: "Sélectionnez le type",
      description: "Description",
      descriptionPlaceholder: "Décrivez ce qui s'est passé…",
      expectedDuration: "Durée estimée (min)",
      expectedDurationPlaceholder: "Entrez la durée en minutes (optionnel)",
      locationInfo: "Emplacement :",
      locationUnavailable: "Localisation indisponible",
      create: "Créer l'incident",
      createSuccess: "Incident signalé avec succès",
      createError: "Échec du signalement",
      filterTitle: "Filtrer les incidents",
      filterByType: "Par type",
      filterByRadius: "Par rayon",
      activeOnly: "Uniquement actifs",
      showOnlyMine: "Mes incidents seulement",
      resetFilters: "Réinitialiser",
      applyFilters: "Appliquer",
      filtersApplied: "Filtres appliqués",
      types: {
        accident: "Accident",
        construction: "Travaux",
        police: "Police",
        hazard: "Danger",
        closure: "Fermeture",
        trafficJam: "Embouteillage",
      },
    },
    pings: {
      activate: "Activer",
      deactivate: "Désactiver",
      activateSuccess: "Ping activé avec succès",
      activateError: "Erreur lors de l'activation du ping",
      deactivateSuccess: "Ping désactivé avec succès",
      deactivateError: "Erreur lors de la désactivation du ping",
      createNew: "Créer un nouveau Ping",
      selectType: "Sélectionner le type de Ping",
      description: "Description",
      descriptionPlaceholder: "Entrez une description pour ce ping...",
      locationInfo: "Emplacement: ",
      locationUnavailable: "Emplacement indisponible",
      create: "Créer Ping",
      edit: "Modifier",
      editPing: "Modifier le Ping",
      delete: "Supprimer",
      confirmDelete: "Confirmer la suppression",
      update: "Mettre à jour",
      isActive: "Actif",
      createdAt: "Créé le",
      status: "Statut",
      location: "Emplacement",
      active: "Actif",
      inactive: "Inactif",
      loading: "Chargement des détails du ping...",
      filterTitle: "Filtrer les Pings",
      filterByType: "Filtrer par Type",
      filterByRadius: "Filtrer par Rayon (km)",
      kilometers: "km",
      activeOnly: "Afficher uniquement les Pings actifs",
      showOnlyMine: "Afficher uniquement mes Pings",
      resetFilters: "Réinitialiser les filtres",
      applyFilters: "Appliquer les filtres",
      filtersApplied: "Filtres appliqués",
      createSuccess: "Ping créé avec succès",
      createError: "Échec de la création du ping",
      updateSuccess: "Ping mis à jour avec succès",
      updateError: "Échec de la mise à jour du ping",
      deleteSuccess: "Ping supprimé avec succès",
      deleteError: "Échec de la suppression du ping",
      fetchError: "Échec du chargement des pings",
      types: {
        bouchon: "bouchon",
        accident: "accident",
        nid_de_poule: "nid de poule",
      },
    },
    profile: {
      defaultName: "Utilisateur",
      editProfile: "Modifier le Profil",
      settings: "Paramètres",
      darkMode: "Mode Sombre",
      language: "Langue",
      notifications: "Notifications",
      logout: "Déconnexion",
      logoutConfirmTitle: "Confirmer la déconnexion",
      logoutConfirmMessage: "Êtes-vous sûr de vouloir vous déconnecter ?",
      cameraPermissionDenied:
        "L'autorisation d'accès à la caméra a été refusée",
      loading: "Chargement du profil...",
      avatarUpdateTitle: "Mise à jour de l'avatar",
      avatarUpdateMessage:
        "La fonctionnalité de mise à jour de l'avatar n'est pas encore complètement implémentée.",
      preferences: "Préférences",
      recentRoutes: "Itinéraires Récents",
      viewAll: "Voir Tout",
      noRoutes: "Vous n'avez pas encore d'itinéraires enregistrés",
      createRoute: "Créer un Itinéraire",
      allRoutes: "Tous les Itinéraires",
      roles: {
        admin: "Administrateur",
        user: "Utilisateur",
        moderator: "Modérateur",
      },
      edit: {
        title: "Modifier le Profil",
        changePhoto: "Changer la Photo",
        personalInfo: "Informations Personnelles",
        nameLabel: "Nom Complet",
        emailLabel: "Email",
        phoneLabel: "Numéro de Téléphone",
        bioLabel: "Biographie",
        nameRequired: "Le nom est requis",
        emailRequired: "L'email est requis",
        emailInvalid: "Entrez un email valide",
        saveChanges: "Enregistrer les Modifications",
        notificationPreferences: "Préférences de Notification",
        emailNotifications: "Notifications par Email",
        emailNotificationsDesc:
          "Recevoir des mises à jour et des alertes par email",
        pushNotifications: "Notifications Push",
        pushNotificationsDesc:
          "Recevoir des notifications en temps réel sur votre appareil",
        success: "Profil Mis à Jour",
        successMessage: "Votre profil a été mis à jour avec succès.",
        error: "Échec de la mise à jour",
        errorMessage:
          "Un problème est survenu lors de la mise à jour de votre profil. Veuillez réessayer.",
        userNotFound:
          "Informations utilisateur non trouvées. Veuillez réessayer.",
      },
    },
    preferences: {
      title: "Préférences de Navigation",
      transportMode: "Mode de Transport par Défaut",
      routeOptions: "Options d'Itinéraire",
      avoidTolls: "Éviter les Péages",
      avoidHighways: "Éviter les Autoroutes",
      distanceUnit: "Unité de Distance",
      kilometers: "Kilomètres (km)",
      miles: "Miles (mi)",
      saveChanges: "Enregistrer les Préférences",
      success: "Préférences Mises à Jour",
      successMessage:
        "Vos préférences de navigation ont été mises à jour avec succès.",
      error: "Échec de la mise à jour",
      errorMessage:
        "Un problème est survenu lors de la mise à jour de vos préférences. Veuillez réessayer.",
      userNotFound:
        "Informations utilisateur non trouvées. Veuillez réessayer.",
    },
    notifications: {
      title: "Notifications",
      empty: "Vous n'avez pas encore de notifications",
      loading: "Chargement des notifications...",
      refresh: "Actualiser",
      markAllRead: "Tout marquer comme lu",
      clearAll: "Tout effacer",
      fetchError: "Échec du chargement des notifications",
      tryAgain: "Réessayer",
    },
    routes: {
      noTolls: "Éviter les péages",
      savedRoutes: "Itinéraires enregistrés",
      new: "Nouveau",
      createRoute: "Créer un itinéraire",
      noRoutes: "Vous n'avez pas encore d'itinéraires enregistrés",
      loading: "Chargement des itinéraires...",
      fetchError: "Erreur lors du chargement des itinéraires",
      from: "De",
      to: "À",
      avoidTolls: "Éviter les péages",
      createNew: "Créer un nouvel itinéraire",
      startPoint: "Point de départ",
      endPoint: "Point d'arrivée",
      latitude: "Latitude",
      longitude: "Longitude",
      transportMode: "Mode de transport",
      calculate: "Calculer l'itinéraire",
      save: "Enregistrer",
      recalculate: "Recalculer",
      routeCalculated: "Itinéraire calculé avec succès",
      routeDetails: "Détails de l'itinéraire",
      createdAt: "Créé le",
      navigate: "Naviguer",
      delete: "Supprimer",
      confirmDelete: "Confirmer la suppression",
      createSuccess: "Itinéraire créé avec succès",
      activeRoute: "Itinéraire actif",
    },
  },
};

export default translations;

// Create i18n instance
const i18n = new I18n(translations);

// Create language context
type LanguageContextType = {
  t: (key: string, options?: object) => string;
  language: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = "user_language_preference";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState("en"); // Default to English

  // Load saved language preference or use device locale
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (savedLanguage) {
          setLanguage(savedLanguage);
        } else {
          // Use device locale, but only if it's one of our supported languages
          const deviceLocale = Localization.locale.split("-")[0]; // Get language code without region
          if (deviceLocale === "fr" || deviceLocale === "en") {
            setLanguage(deviceLocale);
          }
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
      }
    };

    loadLanguage();
  }, []);

  // Update i18n when language changes
  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  // Function to change language
  const changeLanguage = async (lang: string) => {
    setLanguage(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  // Translation function
  const t = (key: string, options?: object) => {
    return i18n.t(key, options);
  };

  return (
    <LanguageContext.Provider value={{ t, language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
