"use client";

import { useState } from "react";
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
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
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
import {
  useGetRoutesByUserQuery,
  useDeleteRouteMutation,
  type Route,
} from "@/store/api";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useRouter } from "expo-router";

// const { width } = Dimensions.get("window");

interface RouteListProps {
  userId: number;
  onRouteSelect: (route: Route) => void;
  onCreateRoute: () => void;
}

export default function RouteList({
  userId,
  onRouteSelect,
  onCreateRoute,
}: RouteListProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const router = useRouter();

  // RTK Query hooks
  const {
    data: routes,
    isLoading,
    error,
    refetch,
  } = useGetRoutesByUserQuery({ userId });
  const [deleteRoute, { isLoading: isDeleting }] = useDeleteRouteMutation();

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDeleteRoute = async (routeId: number) => {
    if (deleteConfirmId === routeId) {
      try {
        await deleteRoute(routeId).unwrap();
        setDeleteConfirmId(null);
      } catch (error) {
        console.error("Error deleting route:", error);
      }
    } else {
      setDeleteConfirmId(routeId);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirmId(null);
      }, 3000);
    }
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

  const renderRouteItem = ({ item, index }: { item: Route; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .duration(400)
        .springify()}
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
                  <Text
                    style={{ color: colors.onPrimaryContainer, fontSize: 12 }}
                  >
                    {item.transportMode.charAt(0).toUpperCase() +
                      item.transportMode.slice(1)}
                  </Text>
                </Chip>

                {item.avoidTolls && (
                  <Chip
                    style={[
                      styles.tollChip,
                      { backgroundColor: colors.secondaryContainer },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.onSecondaryContainer,
                        fontSize: 12,
                      }}
                    >
                      {t("routes.noTolls")}
                    </Text>
                  </Chip>
                )}
              </View>

              <View style={styles.dateContainer}>
                <Calendar
                  size={14}
                  color={colors.text}
                  style={{ opacity: 0.6 }}
                />
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
              <View
                style={[
                  styles.pointIndicator,
                  { backgroundColor: colors.primary },
                ]}
              />
              <View style={styles.pointLine} />
              <Text style={[styles.coordinateLabel, { color: colors.text }]}>
                {t("routes.from")}
              </Text>
              <Text style={[styles.coordinateValue, { color: colors.text }]}>
                {item.startLatitude.toFixed(4)},{" "}
                {item.startLongitude.toFixed(4)}
              </Text>
            </View>

            <View style={styles.coordinateRow}>
              <View
                style={[
                  styles.pointIndicator,
                  { backgroundColor: colors.error },
                ]}
              />
              <Text style={[styles.coordinateLabel, { color: colors.text }]}>
                {t("routes.to")}
              </Text>
              <Text style={[styles.coordinateValue, { color: colors.text }]}>
                {item.endLatitude.toFixed(4)}, {item.endLongitude.toFixed(4)}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon={() => <Navigation size={16} color={colors.onPrimary} />}
              onPress={() => onRouteSelect(item)}
              style={[
                styles.navigateButton,
                { backgroundColor: colors.primary },
              ]}
              labelStyle={{ fontSize: 12 }}
            >
              {t("routes.navigate")}
            </Button>

            <Button
              mode="outlined"
              icon={() => (
                <Trash2
                  size={16}
                  color={
                    deleteConfirmId === item.id ? colors.error : colors.text
                  }
                />
              )}
              onPress={() => handleDeleteRoute(item.id)}
              style={[
                styles.deleteButton,
                {
                  borderColor:
                    deleteConfirmId === item.id ? colors.error : colors.border,
                  backgroundColor:
                    deleteConfirmId === item.id
                      ? colors.errorContainer
                      : "transparent",
                },
              ]}
              textColor={
                deleteConfirmId === item.id ? colors.error : colors.text
              }
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

  const renderEmptyState = () => (
    <Animated.View
      style={styles.emptyContainer}
      entering={FadeInDown.duration(400).springify()}
    >
      <Map size={80} color={colors.primary} style={{ opacity: 0.5 }} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        {t("routes.noRoutes")}
      </Text>
      <Button
        mode="contained"
        onPress={onCreateRoute}
        style={{ marginTop: 24, backgroundColor: colors.primary }}
        icon={() => <Plus size={18} color={colors.onPrimary} />}
      >
        {t("routes.createRoute")}
      </Button>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View
      style={styles.header}
      entering={FadeInDown.duration(400).springify()}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text, marginRight: 20 }]}>
        {t("routes.savedRoutes")}
      </Text>
      <Button
        mode="contained"
        onPress={onCreateRoute}
        style={{ backgroundColor: colors.primary }}
        icon={() => <Plus size={18} color={colors.onPrimary} />}
      >
        {t("routes.new")}
      </Button>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>
          {t("routes.loading")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.error, marginBottom: 16 }}>
          {t("routes.fetchError")}
        </Text>
        <Button
          mode="contained"
          onPress={refetch}
          style={{ backgroundColor: colors.primary }}
        >
          {t("common.retry")}
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}

      <FlatList
        data={routes}
        renderItem={renderRouteItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          routes?.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

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