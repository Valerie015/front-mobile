"use client";

import { useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Keyboard } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "@/providers/language-provider";
import { Search, X } from "lucide-react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

interface SearchBarProps {
  onPlaceSelected: (place: any) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

export default function SearchBarComponent({
  onPlaceSelected,
  onFocus,
  onBlur,
  placeholder,
}: SearchBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<any>(null);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const handleClear = () => {
    setSearchQuery("");
    if (searchRef.current) {
      searchRef.current.clear();
      searchRef.current.blur();
    }
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {!isFocused ? (
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.surface }]}
          onPress={handleFocus}
          activeOpacity={0.8}
        >
          <Search size={20} color={colors.text} />
          <Text style={[styles.searchText, { color: colors.text }]}>
            {placeholder || t("map.searchPlaceholder")}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.autocompleteContainer}>
          <GooglePlacesAutocomplete
            ref={searchRef}
            placeholder={placeholder || t("map.searchPlaceholder")}
            onPress={(data, details = null) => {
              if (details?.geometry?.location) {
                onPlaceSelected({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  description: data.description,
                  placeId: data.place_id,
                });
                handleBlur();
              }
            }}
            query={{
              key: "YOUR_GOOGLE_MAPS_API_KEY", // Remplacez par votre clé API Google Maps
              language: "fr",
            }}
            fetchDetails={true}
            styles={{
              container: {
                flex: 1,
              },
              textInputContainer: {
                flexDirection: "row",
              },
              textInput: {
                height: 50,
                color: colors.text,
                fontSize: 16,
                backgroundColor: colors.surface,
                borderRadius: 8,
                paddingHorizontal: 12,
              },
              listView: {
                position: "absolute",
                top: 50,
                left: 0,
                right: 0,
                backgroundColor: colors.surface,
                zIndex: 1000,
                elevation: 5,
                borderRadius: 8,
                marginTop: 5,
              },
              description: { color: colors.text },
              row: {
                padding: 13,
                height: 50,
              },
            }}
            enablePoweredByContainer={false}
            onFail={(error) => console.error(error)}
            textInputProps={{
              onFocus: handleFocus,
              onBlur: handleBlur,
              onChangeText: setSearchQuery,
              value: searchQuery,
              clearButtonMode: "never",
              returnKeyType: "search",
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchText: {
    marginLeft: 10,
    opacity: 0.6,
  },
  autocompleteContainer: {
    position: "relative",
    zIndex: 50,
    flex: 1,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 15,
    zIndex: 51,
  },
});
