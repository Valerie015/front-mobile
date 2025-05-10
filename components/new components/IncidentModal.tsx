import React from "react";
import { View, FlatList, TouchableOpacity, Text } from "react-native";
import { Portal, Modal, Button } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { StyleSheet } from "react-native";
import { INCIDENT_TYPES } from "@/types";

interface IncidentModalProps {
  visible: boolean;
  selectedIncidentType: string;
  isCreatingIncident: boolean;
  onDismiss: () => void;
  onSelectType: (type: string) => void;
  onSubmit: () => void;
}

const IncidentModal: React.FC<IncidentModalProps> = ({
  visible,
  selectedIncidentType,
  isCreatingIncident,
  onDismiss,
  onSelectType,
  onSubmit,
}) => {
  const { colors } = useTheme();

  const renderIncidentType = ({ item }: { item: { type: string; label: string; icon: any; color: string } }) => {
    const IconComponent = item.icon;
    if (!IconComponent) return null;

    const incidentLabels: { [key: string]: string } = {
      accident: "Accident",
      police: "Police",
      hazard: "Danger",
      roadwork: "Travaux",
    };

    return (
      <TouchableOpacity
        onPress={() => onSelectType(item.type)}
        style={styles.incidentTypeButton}
      >
        <IconComponent size={24} color={item.color} />
        <Text style={styles.incidentTypeText}>
          {incidentLabels[item.type]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.modalTitle}>Signaler un incident</Text>
        <FlatList
          data={INCIDENT_TYPES}
          renderItem={renderIncidentType}
          keyExtractor={(item) => item.type}
          numColumns={2}
          style={styles.incidentTypeList}
        />
        <Button
          mode="contained"
          onPress={onSubmit}
          disabled={isCreatingIncident || !selectedIncidentType}
          style={styles.modalButton}
          theme={{ colors: { primary: colors.primary } }}
        >
          Soumettre
        </Button>
        <Button
          mode="outlined"
          onPress={onDismiss}
          style={styles.modalButton}
          theme={{ colors: { primary: colors.primary } }}
        >
          Annuler
        </Button>
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
  incidentTypeList: {
    marginBottom: 20,
  },
  incidentTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  incidentTypeText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
});

export default IncidentModal;