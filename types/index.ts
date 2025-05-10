import { ImageSourcePropType } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { Car, Siren, AlertTriangle, Construction } from "lucide-react-native";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Incident {
  id: number;
  userId: number;
  userName: string;
  latitude: number | null;
  longitude: number | null;
  type: string;
  description: string;
  createdAt: string;
  expiresAt: string;
  upvotes: number;
  downvotes: number;
  distance: number;
  isActive: boolean;
  color?: string; // Optional, used as fallback
  image?: string; // Image URL for map marker
}

export const INCIDENT_TYPES: {
  type: string;
  label: string;
  icon: LucideIcon;
  color: string;
  image: string;
}[] = [
  {
    type: "accident",
    label: "Accident",
    icon: Car, // Use lucide-react-native icon
    color: "#FF0000",
    image: "/assets/accident.png",
  },
  {
    type: "police",
    label: "Police",
    icon: Siren,
    color: "#0000FF",
    image: "/assets/police.png",
  },
  {
    type: "hazard",
    label: "Danger",
    icon: AlertTriangle,
    color: "#FFA500",
    image: "/assets/hazard.png",
  },
  {
    type: "construction",
    label: "Travaux",
    icon: Construction,
    color: "#800080",
    image: "/assets/roadwork.png",
  },
];

export interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

export interface ValhallaSummary {
  time: number;
  length: number;
}

export interface ValhallaManeuver {
  type: string;
  instruction: string;
  length: number;
  toll?: boolean;
}

export interface ValhallaLeg {
  shape: string;
  maneuvers: ValhallaManeuver[];
}

export interface ValhallaTrip {
  summary: ValhallaSummary;
  legs: ValhallaLeg[];
}

export interface ValhallaResponse {
  trip: ValhallaTrip;
  alternates?: ValhallaTrip[];
}

export type Maneuver = ValhallaManeuver;