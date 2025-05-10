import React from "react";
import { View, Text } from "react-native";
import { Portal, Modal, Button } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { Incident, INCIDENT_TYPES } from "@/types";
import { useVoteIncidentMutation, useUpdateIncidentStatusMutation } from "@/store/api";
import { StyleSheet } from "react-native";

interface IncidentDetailsModalProps {
  visible: boolean;
  selectedIncident: Incident | null;
  onDismiss: () => void;
}

const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  visible,
  selectedIncident,
  onDismiss,
}) => {
  const { colors } = useTheme();
  const [voteIncident] = useVoteIncidentMutation();
  const [updateIncidentStatus] = useUpdateIncidentStatusMutation();

  if (!selectedIncident) return null;

  const incidentType = INCIDENT_TYPES.find(
    (type) => type.type === selectedIncident.type
  );
  const IconComponent = incidentType?.icon;

  const handleUpvote = async () => {
    try {
      await voteIncident({ id: selectedIncident.id, vote: 1 }).unwrap();
    } catch (error) {
      console.error("Error upvoting incident:", error);
    }
  };

  const handleDownvote = async () => {
    try {
      await voteIncident({ id: selectedIncident.id, vote: -1 }).unwrap();
    } catch (error) {
      console.error("Error downvoting incident:", error);
    }
  };

  const handleDisable = async () => {
    try {
      await updateIncidentStatus({ id: selectedIncident.id, isActive: false }).unwrap();
      onDismiss();
    } catch (error) {
      console.error("Error disabling incident:", error);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.modalTitle}>Détails de l'incident</Text>
        <View style={styles.incidentDetailsContainer}>
          {IconComponent && (
            <IconComponent size={32} color={selectedIncident.color} />
          )}
          <Text style={styles.incidentDetailText}>
            Type: {incidentType?.label || selectedIncident.type}
          </Text>
          <Text style={styles.incidentDetailText}>
            Latitude: {selectedIncident.latitude.toFixed(6)}
          </Text>
          <Text style={styles.incidentDetailText}>
            Longitude: {selectedIncident.longitude.toFixed(6)}
          </Text>
          <Text style={styles.incidentDetailText}>
            Description: {selectedIncident.description || "Aucune description"}
          </Text>
          <Text style={styles.incidentDetailText}>
            Signalé par: {selectedIncident.userName}
          </Text>
          <Text style={styles.incidentDetailText}>
            Créé le: {new Date(selectedIncident.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.incidentDetailText}>
            Expire le: {new Date(selectedIncident.expiresAt).toLocaleString()}
          </Text>
          <Text style={styles.incidentDetailText}>
            Votes positifs: {selectedIncident.upvotes}
          </Text>
          <Text style={styles.incidentDetailText}>
            Votes négatifs: {selectedIncident.downvotes}
          </Text>
          <Text style={styles.incidentDetailText}>
            Distance: {selectedIncident.distance.toFixed(2)} km
          </Text>
          <Text style={styles.incidentDetailText}>
            Actif: {selectedIncident.isActive ? "Oui" : "Non"}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleUpvote}
            style={[styles.modalButton, styles.upvoteButton]}
            theme={{ colors: { primary: colors.secondary } }}
          >
            Voter Positif
          </Button>
          <Button
            mode="contained"
            onPress={handleDownvote}
            style={[styles.modalButton, styles.downvoteButton]}
            theme={{ colors: { primary: colors.error } }}
          >
            Voter Négatif
          </Button>
          <Button
            mode="contained"
            onPress={handleDisable}
            style={[styles.modalButton, styles.disableButton]}
            theme={{ colors: { primary: colors.error } }}
            disabled={!selectedIncident.isActive}
          >
            Désactiver
          </Button>
          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.modalButton}
            theme={{ colors: { primary: colors.primary } }}
          >
            Fermer
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 200,
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
  },
  modalButton: {
    marginVertical: 5,
    borderRadius: 8,
  },
  incidentDetailsContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  incidentDetailText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#000000",
  },
  buttonContainer: {
    flexDirection: "column",
    marginTop: 10,
  },
  upvoteButton: {
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
  },
  downvoteButton: {
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#FFC107",
  },
  disableButton: {
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F44336",
  },
});

export default IncidentDetailsModal;