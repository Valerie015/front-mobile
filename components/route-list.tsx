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
import RouteItem from "./RouteItem";

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
  const { data: routes, isLoading, refetch, error } = useGetRoutesByUserQuery({ userId });
  const [deleteRoute, { isLoading: isDeleting }] = useDeleteRouteMutation();

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
      setTimeout(() => {
        setDeleteConfirmId(null);
      }, 3000);
    }
  };


  const renderRouteItem = ({ item, index }: { item: Route; index: number }) => (
    <RouteItem
      item={item}
      index={index}
      onRouteSelect={onRouteSelect}
      handleDeleteRoute={handleDeleteRoute}
      deleteConfirmId={deleteConfirmId}
      isDeleting={isDeleting}
      isDark={isDark}
      colors={colors}
      t={t}
    />
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