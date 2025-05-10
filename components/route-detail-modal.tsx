"use client";

import { useState } from "react";
import { View, StyleSheet, Modal, ScrollView } from "react-native";
import {
  Text,
  Button,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { X, Navigation, Trash2 } from "lucide-react-native";
import {
  useGetRouteByIdQuery,
  useDeleteRouteMutation,
  type Route,
} from "@/store/api";

interface RouteDetailModalProps {
  visible: boolean;
  onClose: () => void;
  routeId: number | null;
  onDelete: () => void;
  onNavigate: (route: Route) => void;
}

export default function RouteDetailModal({
  visible,
  onClose,
  routeId,
  onDelete,
  onNavigate,
}: RouteDetailModalProps) {
  console.log(routeId);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // RTK Query hooks
  const { data: route, isLoading } = useGetRouteByIdQuery(routeId || 0, {
    skip: !routeId,
  });
  const [deleteRoute, { isLoading: isDeleting }] = useDeleteRouteMutation();

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDelete = async () => {
    if (!routeId) return;

    if (isConfirmingDelete) {
      try {
        await deleteRoute(routeId).unwrap();
        onDelete();
        onClose();
      } catch (error) {
        console.error("Error deleting route:", error);
      }
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };

  const handleNavigate = () => {
    if (route) {
      onNavigate(route);
      onClose();
    }
  };

  if (!routeId && !isLoading) return null;

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
            <IconButton
              icon={() => <X size={24} color={colors.text} />}
              onPress={onClose}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                {t("routes.loading")}
              </Text>
            </View>
          ) : (
            route && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                // style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
              >
                <Text style={[styles.routeTitle, { color: colors.text }]}>
                  {t("routes.routeDetails")}
                </Text>

                <View style={styles.detailsContainer}>
                  <Text style={[styles.detailLabel, { color: colors.text }]}>
                    {t("routes.startPoint")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {route.startLatitude.toFixed(6)},{" "}
                    {route.startLongitude.toFixed(6)}
                  </Text>

                  <Text style={[styles.detailLabel, { color: colors.text }]}>
                    {t("routes.endPoint")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {route.endLatitude.toFixed(6)},{" "}
                    {route.endLongitude.toFixed(6)}
                  </Text>

                  <Text style={[styles.detailLabel, { color: colors.text }]}>
                    {t("routes.transportMode")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {route.transportMode}
                  </Text>

                  <Text style={[styles.detailLabel, { color: colors.text }]}>
                    {t("routes.avoidTolls")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {route.avoidTolls ? t("common.yes") : t("common.no")}
                  </Text>

                  <Text style={[styles.detailLabel, { color: colors.text }]}>
                    {t("routes.createdAt")}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatDate(route.createdAt)}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    icon={() => (
                      <Navigation size={18} color={colors.onPrimary} />
                    )}
                    onPress={handleNavigate}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    {t("routes.navigate")}
                  </Button>
                  <Button
                    mode="outlined"
                    icon={() => <Trash2 size={18} color={colors.error} />}
                    onPress={handleDelete}
                    style={[styles.actionButton, { borderColor: colors.error }]}
                    textColor={colors.error}
                    loading={isDeleting}
                    disabled={isDeleting}
                  >
                    {isConfirmingDelete
                      ? t("routes.confirmDelete")
                      : t("routes.delete")}
                  </Button>
                </View>
              </ScrollView>
            )
          )}
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
    alignItems: "flex-end",
    marginBottom: 10,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 14,
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
