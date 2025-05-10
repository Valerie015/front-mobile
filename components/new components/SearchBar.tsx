import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "@/providers/theme-provider";
import { MapPin, User } from "lucide-react-native";

interface SearchBarProps {
  startLabel: string;
  endLabel: string;
  onStartPress: () => void;
  onEndPress: () => void;
  onCurrentLocationPress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  startLabel,
  endLabel,
  onStartPress,
  onEndPress,
  onCurrentLocationPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity style={styles.searchBar} onPress={onStartPress}>
        <MapPin size={20} color={colors.text} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          {startLabel || "Point de départ"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.searchBar} onPress={onEndPress}>
        <MapPin size={20} color={colors.text} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          {endLabel || "Destination"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={onCurrentLocationPress}
      >
        <User size={20} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 20,
    width: "90%",
    alignSelf: "center",
    zIndex: 100,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 5,
    backgroundColor: "#FFFFFFE6",
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    opacity: 0.7,
    color: "#000000",
  },
  currentLocationButton: {
    alignSelf: "flex-end",
    padding: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: "#2196F3",
  },
});

export default SearchBar;