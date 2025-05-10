import React from "react";
import { View, FlatList, TouchableOpacity, Text } from "react-native";
import { Portal, Modal, TextInput, IconButton, ActivityIndicator } from "react-native-paper";
import { useTheme } from "@/providers/theme-provider";
import { MapPin, ArrowLeft, X } from "lucide-react-native";
import { NominatimResult } from "@/types";
import { StyleSheet } from "react-native";

interface SearchModalProps {
  visible: boolean;
  searchMode: "start" | "end";
  query: string;
  searchResults: NominatimResult[];
  searchLoading: boolean;
  onDismiss: () => void;
  onSearch: (text: string) => void;
  onSelect: (result: NominatimResult) => void;
  onClear: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  searchMode,
  query,
  searchResults,
  searchLoading,
  onDismiss,
  onSearch,
  onSelect,
  onClear,
}) => {
  const { colors } = useTheme();

  const renderSearchResult = ({ item }: { item: NominatimResult }) => (
    <TouchableOpacity onPress={() => onSelect(item)}>
      <View style={styles.resultItem}>
        <MapPin size={16} color={colors.primary} />
        <Text style={styles.resultText} numberOfLines={2}>
          {item.display_name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.searchModal}
      >
        <View style={styles.searchModalHeader}>
          <IconButton
            icon={() => <ArrowLeft size={24} color={colors.text} />}
            onPress={onDismiss}
          />
          <TextInput
            mode="flat"
            placeholder={searchMode === "start" ? "Point de départ" : "Destination"}
            placeholderTextColor={colors.text + "80"}
            value={query}
            onChangeText={onSearch}
            style={styles.searchModalInput}
            underlineColor="transparent"
            autoFocus={true}
          />
          {query.length > 0 && (
            <IconButton
              icon={() => <X size={24} color={colors.text} />}
              onPress={onClear}
            />
          )}
        </View>
        {searchLoading && (
          <View style={styles.searchLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        {searchResults.length > 0 && !searchLoading && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id}
            renderItem={renderSearchResult}
            style={styles.searchResultsList}
            keyboardShouldPersistTaps="handled"
          />
        )}
        {searchResults.length === 0 && !searchLoading && query.length > 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>Aucun résultat</Text>
          </View>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  searchModal: {
    flex: 1,
    margin: 0,
    backgroundColor: "#FFFFFF",
  },
  searchModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#FFFFFFE6",
  },
  searchModalInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    backgroundColor: "transparent",
    color: "#000000",
  },
  searchResultsList: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: "#FFFFFF",
  },
  resultText: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
    color: "#000000",
  },
  noResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 14,
    opacity: 0.6,
    color: "#000000",
  },
});

export default SearchModal;