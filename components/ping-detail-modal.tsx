"use client";

import { useState } from "react";
import { View, StyleSheet, Modal, ScrollView, Dimensions } from "react-native";
import {
  Text,
  Button,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import {
  X,
  Edit,
  Trash2,
  MapPin,
  AlertTriangle,
  Info,
  Coffee,
  // ShoppingBag,
  // Car,
  // Users,
  ToggleLeft,
  ToggleRight,
} from "lucide-react-native";
import type { Ping } from "@/store/api";

const { height } = Dimensions.get("window");

interface PingDetailModalProps {
  visible: boolean;
  onClose: () => void;
  ping: Ping | null;
  onEdit: (ping: Ping) => void;
  onDelete: (pingId: number) => void;
  onActivate?: (pingId: number) => void;
  onDeactivate?: (pingId: number) => void;
  isCurrentUserPing: boolean;
  isLoading: boolean;
}

export default function PingDetailModal({
  visible,
  onClose,
  ping,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  isCurrentUserPing,
  isLoading,
}: PingDetailModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get icon based on ping type
  const getPingIcon = () => {
    if (!ping) return <MapPin size={32} color={colors.primary} />;

    switch (ping.type.toLowerCase()) {
      case "bouchon":
        return <AlertTriangle size={32} color="#FF4136" />;
      case "accident":
        return <Info size={32} color="#0074D9" />;
      case "nid_de_poule":
        return <Coffee size={32} color="#FF851B" />;
      default:
        return <MapPin size={32} color={colors.primary} />;
    }
  };

  const handleEdit = () => {
    if (ping) {
      onEdit(ping);
    }
  };

  const handleDelete = () => {
    if (isConfirmingDelete && ping) {
      onDelete(ping.id);
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };

  const handleToggleActive = () => {
    if (!ping) return;

    if (ping.isActive) {
      onDeactivate && onDeactivate(ping.id);
    } else {
      onActivate && onActivate(ping.id);
    }
  };

  // Ajoutons un console.log pour déboguer
  // console.log("PingDetailModal - ping:", ping);
  // console.log("PingDetailModal - visible:", visible);
  // console.log("PingDetailModal - isLoading:", isLoading);

  if (!visible) return null;

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
                {t("pings.loading")}
              </Text>
            </View>
          ) : ping ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.pingHeader}>
                <View style={styles.iconContainer}>{getPingIcon()}</View>
                <Text style={[styles.pingType, { color: colors.text }]}>
                  {ping.type}
                </Text>
              </View>

              <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                {t("pings.description")}
              </Text>
              <Text style={[styles.description, { color: colors.text }]}>
                {ping.description}
              </Text>

              <View style={styles.detailsContainer}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>
                  {t("pings.createdAt")}
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDate(ping.createdAt)}
                </Text>

                <Text style={[styles.detailLabel, { color: colors.text }]}>
                  {t("pings.status")}
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: ping.isActive ? colors.primary : colors.error },
                  ]}
                >
                  {ping.isActive ? t("pings.active") : t("pings.inactive")}
                </Text>

                <Text style={[styles.detailLabel, { color: colors.text }]}>
                  {t("pings.location")}
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {ping.latitude.toFixed(6)}, {ping.longitude.toFixed(6)}
                </Text>
              </View>

              {isCurrentUserPing && (
                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    icon={() => <Edit size={18} color={colors.primary} />}
                    onPress={handleEdit}
                    style={styles.actionButton}
                  >
                    {t("pings.edit")}
                  </Button>
                  <Button
                    mode="outlined"
                    icon={() => <Trash2 size={18} color={colors.error} />}
                    onPress={handleDelete}
                    style={[styles.actionButton, { borderColor: colors.error }]}
                    textColor={colors.error}
                  >
                    {isConfirmingDelete
                      ? t("pings.confirmDelete")
                      : t("pings.delete")}
                  </Button>
                </View>
              )}

              {isCurrentUserPing && (onActivate || onDeactivate) && (
                <Button
                  mode="outlined"
                  icon={() =>
                    ping.isActive ? (
                      <ToggleRight size={18} color={colors.error} />
                    ) : (
                      <ToggleLeft size={18} color={colors.primary} />
                    )
                  }
                  onPress={handleToggleActive}
                  style={[
                    styles.toggleButton,
                    {
                      borderColor: ping.isActive
                        ? colors.error
                        : colors.primary,
                    },
                  ]}
                  textColor={ping.isActive ? colors.error : colors.primary}
                >
                  {ping.isActive ? t("pings.deactivate") : t("pings.activate")}
                </Button>
              )}

              {/* Espace supplémentaire en bas pour s'assurer que tout est visible */}
              <View style={styles.bottomSpacer} />
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                {t("pings.loading") || "Aucune donnée disponible"}
              </Text>
            </View>
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
    maxHeight: height * 0.8, // 80% de la hauteur de l'écran
    minHeight: 400,
  },
  modalHeader: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  pingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 10,
  },
  pingType: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
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
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  toggleButton: {
    marginTop: 10,
    marginBottom: 10,
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
  bottomSpacer: {
    height: 10, // Espace supplémentaire en bas
  },
});
