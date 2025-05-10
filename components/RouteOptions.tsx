import React from "react";
import { View, Text } from "react-native";
import { SegmentedButtons, ActivityIndicator } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { StyleSheet } from "react-native";

interface RouteOptionsProps {
  costing: string;
  isLoading: boolean;
  onCostingChange: (value: string) => void;
}

const RouteOptions: React.FC<RouteOptionsProps> = ({
  costing,
  isLoading,
  onCostingChange,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.routeOptionsContainer}>
      <Text style={styles.routeOptionsTitle}>Options de trajet</Text>
      <SegmentedButtons
        value={costing}
        onValueChange={onCostingChange}
        buttons={isLoading ? [] : [
          { value: "auto", label: "Voiture", icon: "car" },
          { value: "motorcycle", label: "Moto", icon: "motorbike" },
          { value: "bicycle", label: "Vélo", icon: "bicycle" },
          { value: "pedestrian", label: "À pied", icon: "walk" },
        ]}
        /*buttons={[
          { value: "auto", label: "Voiture", icon: "car" },
          { value: "motorcycle", label: "Moto", icon: "motorbike" },
          { value: "bicycle", label: "Vélo", icon: "bicycle" },
          { value: "pedestrian", label: "À pied", icon: "walk" },
        ]}*/
       
        theme={{ colors: { primary: colors.primary || "#FF6200" } }}
        style={styles.segmentedButtons}
      />
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={colors.primary || "#FF6200"}
          style={styles.optionsLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  routeOptionsContainer: {
    position: "absolute",
    top: 150,
    left: 10,
    right: 10,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 200,
    backgroundColor: "#FFFFFFE6",
  },
  routeOptionsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  optionsLoading: {
    marginTop: 8,
    alignSelf: "center",
  },
});

export default RouteOptions;