import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/providers/theme-provider";
import { ArrowLeft, ArrowRight, ArrowUp, RotateCw } from "lucide-react-native";
import { StyleSheet } from "react-native";

interface NavigationInstructionsProps {
  isRouteConfirmed: boolean;
  maneuvers: any[];
}

const NavigationInstructions: React.FC<NavigationInstructionsProps> = ({
  isRouteConfirmed,
  maneuvers,
}) => {
  const { colors } = useTheme();

  if (!isRouteConfirmed || !maneuvers.length) return null;

  const currentManeuver = maneuvers[0];
  const maneuverIcons: { [key: string]: JSX.Element } = {
    kTurnLeft: <ArrowLeft size={24} color={colors.onPrimary} />,
    kTurnRight: <ArrowRight size={24} color={colors.onPrimary} />,
    kContinue: <ArrowUp size={24} color={colors.onPrimary} />,
    kRoundaboutEnter: <RotateCw size={24} color={colors.onPrimary} />,
    default: <ArrowUp size={24} color={colors.onPrimary} />,
  };

  const icon = maneuverIcons[currentManeuver.type] || maneuverIcons.default;

  return (
    <View style={styles.navInstructionsContainer}>
      <View style={styles.navIconContainer}>{icon}</View>
      <View style={styles.navTextContainer}>
        <Text style={styles.navInstructionText}>
          {currentManeuver.instruction}
        </Text>
        <Text style={styles.navDistanceText}>
          {currentManeuver.length.toFixed(2)} km
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navInstructionsContainer: {
    position: "absolute",
    top: 80,
    left: 10,
    right: 10,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 150,
    backgroundColor: "#2196F3CC",
  },
  navIconContainer: {
    marginRight: 10,
  },
  navTextContainer: {
    flex: 1,
  },
  navInstructionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  navDistanceText: {
    fontSize: 14,
    marginTop: 4,
    color: "#FFFFFF",
  },
});

export default NavigationInstructions;