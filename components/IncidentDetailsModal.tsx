import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Portal, Modal, Button } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { Incident, INCIDENT_TYPES } from "@/types";
import { useVoteIncidentMutation, useUpdateIncidentStatusMutation, useGetUserByIdQuery } from "@/store/api";
import { StyleSheet } from "react-native";
import SnackbarComponent from "@/components/SnackbarComponent";

interface IncidentDetailsModalProps {
  visible: boolean;
  selectedIncident: Incident | null;
  onDismiss: () => void;
  onUpdateIncident: (updatedIncident: Incident) => void;
  refetchIncidents: () => void;
}

const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  visible,
  selectedIncident,
  onDismiss,
  onUpdateIncident,
  refetchIncidents,
}) => {
  const { colors } = useTheme();
  const [voteIncident] = useVoteIncidentMutation();
  const [updateIncidentStatus] = useUpdateIncidentStatusMutation();
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);

  // Fetch user details for the incident's userId
  const { data: user, isLoading: isUserLoading, error: userError } = useGetUserByIdQuery(
    selectedIncident?.userId || 0,
    { skip: !selectedIncident || !selectedIncident.userId }
  );

  if (!visible || !selectedIncident) return null;

  const incidentType = INCIDENT_TYPES.find(
    (type) => type.type === selectedIncident.type
  );
  const IconComponent = incidentType?.icon;

  const isExpired = selectedIncident.expiresAt
    ? new Date(selectedIncident.expiresAt) < new Date()
    : false;

  const handleUpvote = async () => {
    if (!selectedIncident.isActive || isExpired) {
      setSnackbarMessage("Impossible de voter : incident inactif ou expiré");
      setSnackbarVisible(true);
      return;
    }

    try {
      const voteResponse = await voteIncident({ id: selectedIncident.id, vote: 1 }).unwrap();
      const updatedIncident: Incident = {
        ...selectedIncident,
        upvotes: voteResponse.upvotes,
        downvotes: voteResponse.downvotes,
      };
      onUpdateIncident(updatedIncident);
      refetchIncidents();
      setSnackbarMessage("Vote positif enregistré");
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error("Error upvoting incident:", error);
      setSnackbarMessage(error?.data?.message || "Erreur lors du vote positif");
      setSnackbarVisible(true);
    }
  };

  const handleDownvote = async () => {
    if (!selectedIncident.isActive || isExpired) {
      setSnackbarMessage("Impossible de voter : incident inactif ou expiré");
      setSnackbarVisible(true);
      return;
    }

    try {
      const voteResponse = await voteIncident({ id: selectedIncident.id, vote: -1 }).unwrap();
      const updatedIncident: Incident = {
        ...selectedIncident,
        downvotes: voteResponse.downvotes,
        upvotes: voteResponse.upvotes,
      };
      onUpdateIncident(updatedIncident);
      refetchIncidents();
      setSnackbarMessage("Vote négatif enregistré");
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error("Error downvoting incident:", error);
      setSnackbarMessage(error?.data?.message || "Erreur lors du vote négatif");
      setSnackbarVisible(true);
    }
  };

  const handleDisable = async () => {
    try {
      await updateIncidentStatus({ id: selectedIncident.id, isActive: false }).unwrap();
      const updatedIncident: Incident = {
        ...selectedIncident,
        isActive: false,
      };
      onUpdateIncident(updatedIncident);
      refetchIncidents();
      setSnackbarMessage("Incident désactivé");
      setSnackbarVisible(true);
      onDismiss();
    } catch (error) {
      console.error("Error disabling incident:", error);
      setSnackbarMessage("Erreur lors de la désactivation");
      setSnackbarVisible(true);
    }
  };

  const latitude = selectedIncident.latitude != null ? selectedIncident.latitude.toFixed(6) : "N/A";
  const longitude = selectedIncident.longitude != null ? selectedIncident.longitude.toFixed(6) : "N/A";
  const distance = selectedIncident.distance != null ? selectedIncident.distance.toFixed(2) : "N/A";

  // Determine display name for "Signalé par"
  const displayUserName = isUserLoading
    ? "Chargement..."
    : userError || !user
    ? selectedIncident.userName || "Anonyme"
    : user.userName || selectedIncident.userName || "Anonyme";

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text style={[styles.modalTitle, { color: "#FF6200" }]}>Détails de l'incident</Text>
        <View style={styles.incidentDetailsContainer}>
          {IconComponent && (
            <IconComponent size={32} color={selectedIncident.color || "#FF6200"} />
          )}
          <Text style={styles.incidentDetailText}>
            Type: <Text style={{ color: "#FF6200" }}>{incidentType?.label || selectedIncident.type || "Inconnu"}</Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Latitude: <Text style={{ color: "#FF6200" }}>{latitude}</Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Longitude: <Text style={{ color: "#FF6200" }}>{longitude}</Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Description: <Text style={{ color: "#FF6200" }}>{selectedIncident.description || "Aucune description"}</Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Signalé par: <Text style={{ color: "#FF6200" }}>
              {isUserLoading ? (
                <ActivityIndicator size="small" color="#FF6200" style={{ marginLeft: 5 }} />
              ) : (
                displayUserName
              )}
            </Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Créé le: <Text style={{ color: "#FF6200" }}>{selectedIncident.createdAt ? new Date(selectedIncident.createdAt).toLocaleString() : "N/A"}</Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Expire le: <Text style={{ color: "#FF6200" }}>{selectedIncident.expiresAt ? new Date(selectedIncident.expiresAt).toLocaleString() : "N/A"}</Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Votes positifs: <Text style={{ color: "#FF6200" }}>{selectedIncident.upvotes != null ? selectedIncident.upvotes : 0}</Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Votes négatifs: <Text style={{ color: "#FF6200" }}>{selectedIncident.downvotes != null ? selectedIncident.downvotes : 0}</Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Distance: <Text style={{ color: "#FF6200" }}>{distance} km</Text>
          </Text>
          <Text style={styles.incidentDetailText}>
            Actif: <Text style={{ color: "#FF6200" }}>{selectedIncident.isActive ? "Oui" : "Non"}</Text>
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleUpvote}
            style={[styles.modalButton, styles.upvoteButton]}
            theme={{ colors: { primary: "#4CAF50" } }}
            disabled={!selectedIncident.isActive || isExpired}
          >
            Voter Positif
          </Button>
          <Button
            mode="contained"
            onPress={handleDownvote}
            style={[styles.modalButton, styles.downvoteButton]}
            theme={{ colors: { primary: "#FFC107" } }}
            disabled={!selectedIncident.isActive || isExpired}
          >
            Voter Négatif
          </Button>
          <Button
            mode="contained"
            onPress={handleDisable}
            style={[styles.modalButton, styles.disableButton]}
            theme={{ colors: { primary: "#F44336" } }}
            disabled={!selectedIncident.isActive || isExpired}
          >
            Désactiver
          </Button>
          <Button
            mode="contained"
            onPress={onDismiss}
            style={[styles.modalButton, { backgroundColor: "#FF6200" }]}
            theme={{ colors: { primary: "#FF6200" } }}
          >
            Fermer
          </Button>
        </View>
        <SnackbarComponent
          visible={snackbarVisible}
          message={snackbarMessage}
          onDismiss={() => setSnackbarVisible(false)}
        />
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