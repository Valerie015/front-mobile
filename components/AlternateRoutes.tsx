import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { Star, DollarSign } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { ValhallaTrip } from "@/types";

interface AlternateRoutesProps {
  routes: ValhallaTrip[];
  recommendedRouteIndex: number;
  onSelectRoute: (index: number) => void;
}

const AlternateRoutes: React.FC<AlternateRoutesProps> = ({
  routes,
  recommendedRouteIndex,
  onSelectRoute,
}) => {
  const { colors } = useTheme();

  const renderAlternateRoute = ({
    item,
    index,
  }: {
    item: ValhallaTrip;
    index: number;
  }) => {
    const isRecommended = recommendedRouteIndex === index;
    const hasToll = item.legs[0]?.maneuvers?.some((m) => m.toll) || false;

    const backgroundColor = index === 0 ? "#4CAF50" : "#2196F3"; // Vert et Bleu
    const textColor = "#FFFFFF";

    return (
      <TouchableOpacity onPress={() => onSelectRoute(index)}>
        <Card style={[styles.alternateRouteCard, { backgroundColor }]}>
          <Card.Content style={styles.alternateRouteContent}>
            <View style={styles.alternateRouteHeader}>
              <Text style={styles.alternateRouteTitle}>
                Itinéraire {index + 1}
              </Text>
              {isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Star size={14} color="#FFD700" />
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
              )}
            </View>
            <View style={styles.alternateRouteDetails}>
              <Text style={[styles.alternateRouteText, { color: textColor }]}>
                {Math.round(item.summary.time / 60)} minutes
              </Text>
              <Text style={styles.alternateRouteText}>
                    {item.summary.length.toFixed(2)} km
                </Text>
              {hasToll && (
                <View style={styles.tollBadge}>
                  <DollarSign size={14} color={textColor} />
                  <Text style={styles.tollText}>Péage</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.alternateRoutesContainer}>
      <FlatList
        data={routes.slice(0, 3)} // On force seulement les 2 premiers itinéraires
        renderItem={renderAlternateRoute}
        keyExtractor={(_, index) => `route-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.alternateRoutesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  alternateRoutesContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 70,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  alternateRoutesList: {
    paddingHorizontal: 12,
  },
  alternateRouteCard: {
    width: 180,
    marginRight: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  alternateRouteContent: {
    flexDirection: "column",
    padding: 12,
  },
  alternateRouteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  alternateRouteTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  alternateRouteDetails: {
    flexDirection: "column",
  },
  alternateRouteText: {
    fontSize: 13,
    marginVertical: 2,
    color: "#FFFFFF",
  },
  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700AA",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 4,
  },
  tollBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  tollText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#FFFFFF",
  },
});

export default AlternateRoutes;
