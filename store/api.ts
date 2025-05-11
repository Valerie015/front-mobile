import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "@/store"
import Constants from 'expo-constants';

// Define Incident types
export interface Incident {
  id: number
  userName: string
  userId: number
  latitude: number
  longitude: number
  type: string // accident, construction, police, hazard, closure, traffic_jam
  description: string
  // expectedDuration?: number // en minutes, optionnel
  createdAt: string
  expiresAt: string
  upvotes: number
  downvotes: number
  // distance?: number // en km, fourni par le serveur
  isActive: boolean
}

export interface CreateIncidentRequest {
  latitude: number
  longitude: number
  type: string
  description: string
  expectedDuration?: number
}

export interface VoteIncidentRequest {
  vote: 1 | -1
}

export interface UpdateIncidentStatusRequest {
  isActive: boolean
}

// Define Ping types
export interface Ping {
  id: number
  userName: string,
  latitude: number
  longitude: number
  userId: number
  type: string
  description: string
  createdAt: string
  expiresAt: string
  upvotes: number
  downvotes: number
  isActive: boolean
}

export interface VoteResponse {
  id: number;
  upvotes: number;
  downvotes: number;
}

export interface StatusResponse {
  id: number;
  isActive: boolean;
}

export interface NearbyIncident {
  id: number;
  userId: number;
  userName: string;
  latitude: number;
  longitude: number;
  type: string;
  description: string;
  createdAt: string;
  expiresAt: string;
  upvotes: number;
  downvotes: number;
  distance: number;
  isActive: boolean;
}
export interface CreatePingRequest {
  latitude: number
  longitude: number
  userId: number
  type: string
  description: string
  isActive: boolean
}

// Define Route types
export interface Route {
  id: number
  userId: number
  startLatitude: number
  startLongitude: number
  endLatitude: number
  endLongitude: number
  transportMode: string
  avoidTolls: boolean
  createdAt: string
  routeData: string
}

export interface CreateRouteRequest {
  // userId: number
  startLatitude: number
  startLongitude: number
  endLatitude: number
  endLongitude: number
  transportMode: string
  avoidTolls: boolean
  // routeData: string
}

export interface RouteCalculationRequest {
  startLatitude: number
  startLongitude: number
  endLatitude: number
  endLongitude: number
  transportMode: string
  avoidTolls: boolean
}

// Define Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: string
}

export interface RegisterRequest {
  userName: string
  email: string
  password: string
  role?: string
}

export interface RegisterResponse {
  message: string
}

// Define User types
export interface User {
  id: number
  userName: string
  email: string
  role?: string
}

export interface UpdateUserRequest {
  userName: string
  email: string
}

export interface UserPreferences {
  id: number
  defaultTransportMode: string
  avoidTolls: boolean
  avoidHighways: boolean
  distanceUnit: string
}

export interface UpdateUserPreferencesRequest {
  defaultTransportMode: string
  avoidTolls: boolean
  avoidHighways: boolean
  distanceUnit: string
}
const { API_URL } = Constants.expoConfig.extra;
// Define the API
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // Utiliser l'adresse IP correcte au lieu de localhost
    baseUrl:API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Ajouter seulement les en-têtes essentiels
      headers.set("Content-Type", "application/json")
      headers.set("Accept", "application/json")

      // Ajouter le token d'authentification s'il existe
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: ["Incident", "Ping", "Route", "User", "UserPreferences"],
  endpoints: (builder) => ({
    // AUTH ENDPOINTS
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/api/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    // USER ENDPOINTS
    getUserById: builder.query<User, number>({
      query: (id) => ({
        url: `/api/user/me`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    getUserProfile: builder.query<User, void>({
      query: () => ({
        url: "/api/user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    updateUser: builder.mutation<User, { id: number; userData: UpdateUserRequest }>({
      query: ({ id, userData }) => ({
        url: `/api/user/update/me`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }, "User"],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/user/delete/me`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }, "User"],
    }),

    updateUserPreferences: builder.mutation<UserPreferences, { id: number; preferences: UpdateUserPreferencesRequest }>(
      {
        query: ({ id, preferences }) => ({
          url: `/api/user/${id}/preferences`,
          method: "PATCH",
          body: preferences,
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "UserPreferences", id }],
      },
    ),

    // INCIDENT ENDPOINTS
    createIncident: builder.mutation<Incident, CreateIncidentRequest>({
      query: (body) => ({
        url: "/api/incident",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Incident", id: "LIST" }],
    }),

    getNearbyIncidents: builder.query<NearbyIncident[], { latitude: number; longitude: number; radius?: number; types?: string }>({
      query: ({ latitude, longitude, radius = 5, types }) => ({
        url: 'api/incident/nearby',
        params: { latitude, longitude, radius, types },
      }),
      providesTags: ['Incident'],
    }),

    voteIncident: builder.mutation<VoteResponse, { id: number; vote: number }>({
      query: ({ id, vote }) => ({
        url: `api/incident/${id}/vote`,
        method: 'POST',
        body: { vote },
      }),
      invalidatesTags: ['Incident'],
    }),

    updateIncidentStatus: builder.mutation<StatusResponse, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `api/incident/${id}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['Incident'],
    }),

    getIncidentById: builder.query<Incident, number>({
      query: (id) => ({
        url: `/api/incident/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Incident", id }],
      transformResponse: (response: any) => response,
    }),

    // PING ENDPOINTS
    // Get all pings
    getAllPings: builder.query<Ping[], boolean>({
      query: (activeOnly = false) => ({
        url: `/api/Pings?activeOnly=${activeOnly}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Ping" as const, id })), { type: "Ping", id: "LIST" }]
          : [{ type: "Ping", id: "LIST" }],
      // Add transformResponse to handle potential issues
      transformResponse: (response: any) => {
        console.log("Transform Response:", response)
        // If response is a string, try to parse it
        if (typeof response === "string") {
          try {
            return JSON.parse(response)
          } catch (e) {
            console.error("Error parsing response:", e)
            return []
          }
        }
        return response || []
      },
      // Add transformErrorResponse to better handle errors
      transformErrorResponse: (response: { status: number; data: any }) => {
        console.error("Error Response:", response)
        return { status: response.status, data: response.data }
      },
    }),

    // Get a specific ping by ID
    getPingById: builder.query<Ping, number>({
      query: (id) => ({
        url: `/api/Pings/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Ping", id }],
      transformResponse: (response: any) => {
        if (typeof response === "string") {
          try {
            return JSON.parse(response)
          } catch (e) {
            console.error("Error parsing response:", e)
            return null
          }
        }
        return response
      },
    }),

    // Get pings by type
    getPingsByType: builder.query<Ping[], string>({
      query: (type) => ({
        url: `/api/Pings/type/${type}`,
        method: "GET",
      }),
      providesTags: [{ type: "Ping", id: "LIST" }],
      transformResponse: (response: any) => {
        if (typeof response === "string") {
          try {
            return JSON.parse(response)
          } catch (e) {
            console.error("Error parsing response:", e)
            return []
          }
        }
        return response || []
      },
    }),

    // Get pings by user
    getPingsByUser: builder.query<Ping[], number>({
      query: (userId) => ({
        url: `/api/Pings/user/${userId}`,
        method: "GET",
      }),
      providesTags: [{ type: "Ping", id: "LIST" }],
      transformResponse: (response: any) => {
        if (typeof response === "string") {
          try {
            return JSON.parse(response)
          } catch (e) {
            console.error("Error parsing response:", e)
            return []
          }
        }
        return response || []
      },
    }),

    // Get nearby pings
    getNearbyPings: builder.query<Ping[], { latitude: number; longitude: number; radiusKm: number }>({
      query: ({ latitude, longitude, radiusKm }) => ({
        url: `/api/Pings/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`,
        method: "GET",
      }),
      providesTags: [{ type: "Ping", id: "LIST" }],
      transformResponse: (response: any) => {
        if (typeof response === "string") {
          try {
            return JSON.parse(response)
          } catch (e) {
            console.error("Error parsing response:", e)
            return []
          }
        }
        return response || []
      },
    }),

    // Create a new ping
    createPing: builder.mutation<Ping, CreatePingRequest>({
      query: (ping) => ({
        url: "/api/Ping",
        method: "POST",
        body: ping,
      }),
      invalidatesTags: [{ type: "Ping", id: "LIST" }],
    }),

    // Update a ping
    updatePing: builder.mutation<Ping, { id: number; ping: Partial<Ping> }>({
      query: ({ id, ping }) => ({
        url: `/api/Pings/${id}`,
        method: "PUT",
        body: ping,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Ping", id },
        { type: "Ping", id: "LIST" },
      ],
    }),

    // Delete a ping
    deletePing: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/Pings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Ping", id },
        { type: "Ping", id: "LIST" },
      ],
    }),

    // Activate a ping
    activatePing: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/Pings/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Ping", id },
        { type: "Ping", id: "LIST" },
      ],
    }),

    // Deactivate a ping
    deactivatePing: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/Pings/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Ping", id },
        { type: "Ping", id: "LIST" },
      ],
    }),

    // ROUTE ENDPOINTS
    // Get routes by user
    getRoutesByUser: builder.query<Route[], { userId: number }>({
      query: ({ userId }) => ({
        url: `/api/route/user/${userId}/recent`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Route" as const, id })), { type: "Route", id: "LIST" }]
          : [{ type: "Route", id: "LIST" }],
      transformResponse: (response: any) => {
        if (typeof response === "string") {
          try {
            return JSON.parse(response)
          } catch (e) {
            console.error("Error parsing response:", e)
            return []
          }
        }
        return response || []
      },
    }),

    // Get a specific route by ID
    getRouteById: builder.query<Route, number>({
      query: (id) => ({
        url: `/api/route/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Route", id }],
      transformResponse: (response: any) => {
        if (typeof response === "string") {
          try {
            return JSON.parse(response)
          } catch (e) {
            console.error("Error parsing response:", e)
            return null
          }
        }
        return response
      },
    }),

    // Create a new route
    createRoute: builder.mutation<Route, CreateRouteRequest>({
      query: (route) => ({
        url: "/api/route",
        method: "POST",
        body: route,
      }),
      invalidatesTags: [{ type: "Route", id: "LIST" }],
    }),

    // Delete a route
    deleteRoute: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/route/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Route", id },
        { type: "Route", id: "LIST" },
      ],
    }),

    // Calculate a route
    calculateRoute: builder.mutation<string, RouteCalculationRequest>({
      query: (route) => ({
        url: `/api/route/calculate`,
        method: "POST",
        body: route
      }),
      transformResponse: (response: any) => {
        if (typeof response === "string") {
          return response
        }
        return JSON.stringify(response)
      },
    }),
  }),
})

// Export hooks for usage in components
export const {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,

  // User hooks
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useGetUserProfileQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserPreferencesMutation,

  // Ping hooks
  useGetAllPingsQuery,
  useGetPingByIdQuery,
  useGetPingsByTypeQuery,
  useGetPingsByUserQuery,
  useGetNearbyPingsQuery,
  useCreatePingMutation,
  useUpdatePingMutation,
  useDeletePingMutation,
  useActivatePingMutation,
  useDeactivatePingMutation,

  // Incident hooks
  useCreateIncidentMutation,
  useGetNearbyIncidentsQuery,
  useVoteIncidentMutation,
  useUpdateIncidentStatusMutation,
  useGetIncidentByIdQuery,

  // Route hooks
  useGetRoutesByUserQuery,
  useGetRouteByIdQuery,
  useCreateRouteMutation,
  useDeleteRouteMutation,
  useCalculateRouteMutation,
} = api
