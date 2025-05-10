import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
  Divider,
} from "react-native-paper";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import {
  MapPin,
  Navigation,
  Trash2,
  Calendar,
  Clock,
  ArrowLeft,
  Plus,
  Car,
  Bike,
  Map,
} from "lucide-react-native";



type Props = {
  item: Route;
  index: number;
  onRouteSelect: (route: Route) => void;
  handleDeleteRoute: (id: string) => void;
  deleteConfirmId: string | null;
  isDeleting: boolean;
  isDark: boolean;
  colors: any;
  t: (key: string) => string;
};

const RouteItem: React.FC<Props> = ({
  item,
  index,
  onRouteSelect,
  handleDeleteRoute,
  deleteConfirmId,
  isDeleting,
  isDark,
  colors,
  t,
}) => {
  const [startAddress, setStartAddress] = useState<string>("");
  const [endAddress, setEndAddress] = useState<string>("");
  const [loadingStart, setLoadingStart] = useState(true);
  const [loadingEnd, setLoadingEnd] = useState(true);


  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            "User-Agent": "EasyGoApp/1.0 (test@gmail.com)",
          },
        }
      );
      if (!response.ok) {
        console.error("Nominatim error:", response.statusText);
        return `${lat}, ${lon}`;
      }

      const data = await response.json();
      if (data && data.display_name) {
        const { house_number, road, postcode, city, town, village } = data.address || {};

            const locality = city || town || village || "";
            const addressParts = [
              [house_number, road].filter(Boolean).join(" "),
              [postcode, locality].filter(Boolean).join(" ")
            ].filter(Boolean);

        return addressParts.join(", ");
      } else {
        return `${lat}, ${lon}`; // Retourne les coordonnées si aucune adresse n'est trouvée
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return `${lat}, ${lon}`; // Retourne les coordonnées en cas d'erreur
    }
  };



  // Format date to be more readable
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    // Format time from date
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

  // Get transport mode icon
  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "auto":
        return <Car size={16} color={colors.primary} />;
      case "bicycle":
        return <Bike size={16} color={colors.primary} />;
      case "pedestrian":
        return <MapPin size={16} color={colors.primary} />;
      default:
        return <Navigation size={16} color={colors.primary} />;
    }
  };

  const getTransportLabel = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "auto":
        return "Voiture";
      case "bicycle":
        return "Vélo";
      case "pedestrian":
        return "Piéton";
      default:
        return mode;
    }
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingStart(true);
      setLoadingEnd(true);
      const [start, end] = await Promise.all([
        reverseGeocode(item.startLatitude, item.startLongitude),
        reverseGeocode(item.endLatitude, item.endLongitude),
      ]);
      setStartAddress(start);
      setEndAddress(end);
      setLoadingStart(false);
      setLoadingEnd(false);
    };
    fetchAddresses();
  }, [item.startLatitude, item.startLongitude, item.endLatitude, item.endLongitude]);


  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400).springify()}
      layout={Layout.springify()}
    >
      <Card
        style={[
          styles.routeCard,
          {
            backgroundColor: isDark ? colors.surfaceVariant : colors.surface,
            borderColor: colors.border,
          },
        ]}
        mode="outlined"
      >
        <Card.Content>
          <View style={styles.routeHeader}>
            <View style={styles.routeInfo}>
              <View style={styles.routeTitle}>
                <Chip
                  icon={() => getTransportIcon(item.transportMode)}
                  style={[
                    styles.transportChip,
                    { backgroundColor: colors.primaryContainer },
                  ]}
                >
                  <Text style={{ color: colors.onPrimaryContainer, fontSize: 12 }}>
                    {getTransportLabel(item.transportMode)}
                  </Text>
                </Chip>

                {item.avoidTolls && (
                  <Chip
                    style={[
                      styles.tollChip,
                      { backgroundColor: colors.secondaryContainer },
                    ]}
                  >
                    <Text style={{ color: colors.onSecondaryContainer, fontSize: 12 }}>
                      {t("routes.noTolls")}
                    </Text>
                  </Chip>
                )}
              </View>

              <View style={styles.dateContainer}>
                <Calendar size={14} color={colors.text} style={{ opacity: 0.6 }} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDate(item.createdAt)}
                </Text>
                <Clock
                  size={14}
                  color={colors.text}
                  style={{ opacity: 0.6, marginLeft: 8 }}
                />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateRow}>
              <View style={[styles.pointIndicator, { backgroundColor: colors.primary }]} />
              <View style={styles.pointLine} />
              <Text style={[styles.coordinateLabel, { color: colors.text }]}>
                {t("routes.from")}
              </Text>
              {loadingStart ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
              ) : (
                <Text style={[styles.coordinateValue, { color: colors.text }]}>
                  {startAddress}
                </Text>
              )}
            </View>

            <View style={styles.coordinateRow}>
              <View style={[styles.pointIndicator, { backgroundColor: colors.error }]} />
              <Text style={[styles.coordinateLabel, { color: colors.text }]}>
                {t("routes.to")}
              </Text>
              {loadingStart ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
                ) : (
              <Text style={[styles.coordinateValue, { color: colors.text }]}>
                {endAddress}
              </Text>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon={() => <Navigation size={16} color={colors.onPrimary} />}
              onPress={() => onRouteSelect(item)}
              style={[styles.navigateButton, { backgroundColor: colors.primary }]}
              labelStyle={{ fontSize: 12 }}
            >
              {t("routes.navigate")}
            </Button>

            <Button
              mode="outlined"
              icon={() => (
                <Trash2
                  size={16}
                  color={deleteConfirmId === item.id ? colors.error : colors.text}
                />
              )}
              onPress={() => handleDeleteRoute(item.id)}
              style={[
                styles.deleteButton,
                {
                  borderColor: deleteConfirmId === item.id ? colors.error : colors.border,
                  backgroundColor:
                    deleteConfirmId === item.id ? colors.errorContainer : "transparent",
                },
              ]}
              textColor={deleteConfirmId === item.id ? colors.error : colors.text}
              loading={isDeleting && deleteConfirmId === item.id}
              disabled={isDeleting}
              labelStyle={{ fontSize: 12 }}
            >
              {deleteConfirmId === item.id
                ? t("routes.confirmDelete")
                : t("routes.delete")}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  routeCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  routeInfo: {
    flex: 1,
  },
  routeTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  transportChip: {
    marginRight: 8,
    height: 28,
  },
  tollChip: {
    height: 28,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 12,
  },
  coordinatesContainer: {
    marginBottom: 16,
  },
  coordinateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  pointIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  pointLine: {
    position: "absolute",
    left: 5,
    top: 10,
    width: 1,
    height: 20,
    backgroundColor: "#ccc",
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: "500",
    width: 40,
    marginRight: 8,
  },
  coordinateValue: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navigateButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});

export default RouteItem;
