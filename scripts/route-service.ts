// Service pour gérer les appels à l'API de navigation

export interface ValhallaLocation {
    lat: number
    lon: number
}

export interface ValhallaRouteRequest {
    locations: ValhallaLocation[]
    costing: string
    alternates?: number
    language?: string
}

export interface ValhallaManeuver {
    type: number
    instruction: string
    verbal_pre_transition_instruction: string
    verbal_post_transition_instruction?: string
    street_names?: string[]
    time: number
    length: number
    begin_shape_index: number
    end_shape_index: number
    travel_mode: string
    travel_type: string
    verbal_multi_cue?: boolean
    verbal_transition_alert_instruction?: string
    bearing_before?: number
    bearing_after?: number
}

export interface ValhallaLeg {
    maneuvers: ValhallaManeuver[]
    summary: {
        time: number
        length: number
        min_lat: number
        min_lon: number
        max_lat: number
        max_lon: number
        has_time_restrictions: boolean
        has_toll: boolean
        has_highway: boolean
        has_ferry: boolean
    }
    shape: string
}

export interface ValhallaRouteResponse {
    trip: {
        locations: any[]
        legs: ValhallaLeg[]
        summary: {
            time: number
            length: number
            min_lat: number
            min_lon: number
            max_lat: number
            max_lon: number
        }
        status_message: string
        status: number
        units: string
        language: string
    }
    alternates?: {
        trip: {
            legs: ValhallaLeg[]
            summary: any
        }
    }[]
}

// Fonction pour décoder le polyline encodé de Valhalla
export function decodeValhallaPoly(encoded: string): { lat: number; lng: number }[] {
    const points: { lat: number; lng: number }[] = []
    let index = 0
    const len = encoded.length
    let lat = 0
    let lng = 0

    while (index < len) {
        let b
        let shift = 0
        let result = 0

        do {
            b = encoded.charCodeAt(index++) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)

        const dlat = result & 1 ? ~(result >> 1) : result >> 1
        lat += dlat

        shift = 0
        result = 0

        do {
            b = encoded.charCodeAt(index++) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)

        const dlng = result & 1 ? ~(result >> 1) : result >> 1
        lng += dlng

        points.push({
            lat: lat / 1e6,
            lng: lng / 1e6,
        })
    }

    return points
}

// Convertir les points Valhalla en format compatible avec react-native-maps
export function convertValhallaPointsToMapPoints(
    points: { lat: number; lng: number }[],
): { latitude: number; longitude: number }[] {
    return points.map((point) => ({
        latitude: point.lat,
        longitude: point.lng,
    }))
}

// Fonction pour obtenir l'icône correspondant au type de manœuvre Valhalla
export function getManeuverIcon(type: number): string {
    switch (type) {
        case 1: // départ
            return "arrow-up"
        case 2: // arrivée
        case 3:
        case 4:
            return "map-marker"
        case 10: // tourner à droite
        case 11:
        case 12:
            return "arrow-right"
        case 15: // tourner à gauche
        case 16:
        case 17:
            return "arrow-left"
        case 8: // continuer
        case 9:
            return "arrow-up"
        case 22: // rond-point
        case 23:
        case 24:
        case 26:
            return "rotate-right"
        case 27: // sortie de rond-point
            return "arrow-up-right"
        case 5: // rampe
        case 6:
            return "arrow-up-right"
        case 7: // sortie
            return "arrow-up-right"
        case 13: // demi-tour à droite
            return "rotate-right"
        case 14: // demi-tour à gauche
            return "rotate-left"
        case 18: // rampe à droite
            return "arrow-up-right"
        case 19: // rampe à gauche
            return "arrow-up-left"
        case 20: // sortie à droite
            return "arrow-up-right"
        case 21: // sortie à gauche
            return "arrow-up-left"
        default:
            return "arrow-up"
    }
}

// Fonction pour calculer la distance entre deux points (en km)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

// Fonction pour formater le temps en minutes et secondes
export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)

    if (minutes === 0) {
        return `${remainingSeconds} sec`
    } else if (remainingSeconds === 0) {
        return `${minutes} min`
    } else {
        return `${minutes} min ${remainingSeconds} sec`
    }
}

// Fonction pour formater la distance en km ou m
export function formatDistance(kilometers: number): string {
    if (kilometers < 0.1) {
        return `${Math.round(kilometers * 1000)} m`
    } else if (kilometers < 10) {
        return `${kilometers.toFixed(1)} km`
    } else {
        return `${Math.round(kilometers)} km`
    }
}

// Convertir le type de transport en format Valhalla
export function convertTransportMode(mode: string): string {
    switch (mode) {
        case "driving":
            return "auto"
        case "walking":
            return "pedestrian"
        case "bicycling":
            return "bicycle"
        case "transit":
            return "bus"
        default:
            return "auto"
    }
}
