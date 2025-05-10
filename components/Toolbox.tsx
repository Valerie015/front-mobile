import React, { useRef } from "react";
import { View, Animated } from "react-native";
import { FAB } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { Menu, Compass, Layers, Navigation, RouteIcon, AlertTriangle } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { LatLng } from "react-native-maps";

interface ToolboxProps {
  isToolboxOpen: boolean;
  isMapRotated: boolean;
  isTracking: boolean;
  isRouteConfirmed: boolean;
  startLocation: LatLng | null;
  endLocation: LatLng | null;
  toggleToolbox: () => void;
  resetMapRotation: () => void;
  toggleMapType: () => void;
  centerMapOnUserLocation: (withHeading: boolean) => void;
  startRoute: () => void;
  openIncidentModal: () => void;
}

const Toolbox: React.FC<ToolboxProps> = ({
  isToolboxOpen,
  isMapRotated,
  isTracking,
  isRouteConfirmed,
  startLocation,
  endLocation,
  toggleToolbox,
  resetMapRotation,
  toggleMapType,
  centerMapOnUserLocation,
  startRoute,
  openIncidentModal,
}) => {
  const { colors } = useTheme();
  const toolboxAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const toValue = isToolboxOpen ? 1 : 0;
    Animated.spring(toolboxAnim, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [isToolboxOpen]);

  return (
    <View style={styles.toolboxContainer}>
      {/* <FAB
        icon={() => <Menu size={22} color={colors.onPrimary} />}
        style={styles.toolboxFab}
        onPress={toggleToolbox}
      /> */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 60,
          right: 0,
          alignItems: "flex-end",
          width: 48,
          transform: [
            {
              translateY: toolboxAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -180],
              }),
            },
          ],
          opacity: toolboxAnim,
        }}
      >
        {isMapRotated && (
          <FAB
            icon={() => <Compass size={24} color={colors.onPrimary} />}
            style={styles.toolboxItem}
            onPress={() => {
              resetMapRotation();
              toggleToolbox();
            }}
            small
          />
        )}
        <FAB
          icon={() => <Layers size={24} color={colors.onPrimary} />}
          style={styles.toolboxItem}
          onPress={() => {
            toggleMapType();
            toggleToolbox();
          }}
          small
        />
        <FAB
          icon={() => <Navigation size={24} color={colors.onPrimary} />}
          style={styles.toolboxItem}
          onPress={() => {
            centerMapOnUserLocation(true);
            toggleToolbox();
          }}
          small
        />
        {!isRouteConfirmed && (
          <FAB
            icon={() => <RouteIcon size={24} color={colors.onPrimary} />}
            style={styles.toolboxItem}
            onPress={() => {
              startRoute();
              toggleToolbox();
            }}
            small
            disabled={!startLocation || !endLocation}
          />
        )}
        {isTracking && (
          <FAB
            icon={() => <AlertTriangle size={24} color={colors.onPrimary} />}
            style={styles.toolboxItem}
            onPress={() => {
              openIncidentModal();
              toggleToolbox();
            }}
            small
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  toolboxContainer: {
    position: "absolute",
    right: 12,
    bottom: 20,
    zIndex: 80,
    alignItems: "flex-end",
    overflow: "hidden",
  },
  toolboxFab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: "#2196F3",
  },
  toolboxItem: {
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: "#2196F3",
  },
});

export default Toolbox;