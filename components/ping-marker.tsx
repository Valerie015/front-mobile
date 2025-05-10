"use client";
import { View, StyleSheet } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { Text, Card } from "react-native-paper";
import {
  MapPin,
  AlertTriangle,
  Info,
  Coffee,
  ShoppingBag,
  Car,
  Users,
} from "lucide-react-native";
import { useTheme } from "@/providers/theme-provider";
import type { Ping } from "@/store/api";

interface PingMarkerProps {
  ping: Ping;
  onPress?: () => void;
  onCalloutPress?: () => void;
}

export default function PingMarker({
  ping,
  onPress,
  onCalloutPress,
}: PingMarkerProps) {
  const { colors } = useTheme();

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get icon and color based on ping type
  const getPingIcon = () => {
    switch (ping.type.toLowerCase()) {
      case "danger":
        return <AlertTriangle size={24} color="#FF4136" />;
      case "info":
        return <Info size={24} color="#0074D9" />;
      case "coffee":
        return <Coffee size={24} color="#FF851B" />;
      case "shopping":
        return <ShoppingBag size={24} color="#2ECC40" />;
      case "transport":
        return <Car size={24} color="#B10DC9" />;
      case "social":
        return <Users size={24} color="#FFDC00" />;
      default:
        return <MapPin size={24} color={colors.primary} />;
    }
  };

  // Get marker color based on ping type
  const getPingColor = () => {
    switch (ping.type.toLowerCase()) {
      case "danger":
        return "#FF4136";
      case "info":
        return "#0074D9";
      case "coffee":
        return "#FF851B";
      case "shopping":
        return "#2ECC40";
      case "transport":
        return "#B10DC9";
      case "social":
        return "#FFDC00";
      default:
        return colors.primary;
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: ping.latitude,
        longitude: ping.longitude,
      }}
      pinColor={getPingColor()}
      onPress={onPress}
    >
      <View style={styles.markerContainer}>{getPingIcon()}</View>
      <Callout onPress={onCalloutPress} tooltip>
        <Card style={styles.calloutContainer}>
          <Card.Content>
            <Text style={styles.calloutTitle}>{ping.type}</Text>
            <Text style={styles.calloutDescription}>{ping.description}</Text>
            <Text style={styles.calloutDate}>{formatDate(ping.createdAt)}</Text>
          </Card.Content>
        </Card>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  calloutContainer: {
    width: 200,
    borderRadius: 8,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    textTransform: "capitalize",
  },
  calloutDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  calloutDate: {
    fontSize: 12,
    opacity: 0.7,
  },
});
