"use client";

import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "@/providers/language-provider";
import RouteList from "@/components/route-list";
import RouteFormModal from "@/components/route-form";
import RouteDetailModal from "@/components/route-detail-modal";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { Route } from "@/store/api";

export default function RoutesScreen() {
//   const { colors } = useTheme();
  const { t } = useTranslation();

  // Get user info
  const authUser = useSelector((state: RootState) => state.auth.user);
  const userId = authUser?.id || 1;

  // State
  const [showRouteFormModal, setShowRouteFormModal] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [showRouteDetailModal, setShowRouteDetailModal] = useState(false);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);

  const handleRouteSelect = (route: Route) => {
    setActiveRoute(route);
    setSelectedRouteId(route.id);
    setShowRouteDetailModal(true);
  };

  const handleRouteDelete = () => {
    setActiveRoute(null);
    setSelectedRouteId(null);
  };

  return (
    <View style={[styles.container]}>
      <RouteList
        userId={userId}
        onRouteSelect={handleRouteSelect}
        onCreateRoute={() => setShowRouteFormModal(true)}
      />

      {/* Route Form Modal */}
      <RouteFormModal
        visible={showRouteFormModal}
        onClose={() => setShowRouteFormModal(false)}
        onSuccess={() => {
          setShowRouteFormModal(false);
        }}
        userId={userId}
        currentLocation={null}
      />

      {/* Route Detail Modal */}
      <RouteDetailModal
        visible={showRouteDetailModal}
        onClose={() => setShowRouteDetailModal(false)}
        routeId={selectedRouteId}
        onDelete={handleRouteDelete}
        onNavigate={(route) => {
          setActiveRoute(route);
          setShowRouteDetailModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});