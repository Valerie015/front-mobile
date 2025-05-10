import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import * as SecureStore from "expo-secure-store"
import { api } from "../api"

interface User {
  id: number
  email: string
  userName: string
  role?: string
  avatar?: string
  phone?: string
  bio?: string
  settings?: {
    emailNotifications: boolean
    pushNotifications: boolean
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token
      state.isAuthenticated = true

      // Store token in secure storage
      SecureStore.setItemAsync("userToken", action.payload.token)
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false

      // Remove token from secure storage
      SecureStore.deleteItemAsync("userToken")
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Quand le login réussit, mettre à jour le token
      .addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.token = payload.token
        state.isAuthenticated = true
        SecureStore.setItemAsync("userToken", payload.token)
      })
      // Quand le profil utilisateur est récupéré, mettre à jour l'utilisateur
      .addMatcher(api.endpoints.getUserById.matchFulfilled, (state, { payload }) => {
        state.user = {
          id: payload.id,
          email: payload.email,
          userName: payload.userName,
          role: payload.role,
          // Conserver les autres propriétés si elles existent
          avatar: state.user?.avatar,
          phone: state.user?.phone,
          bio: state.user?.bio,
          settings: state.user?.settings,
        }
      })
  },
})

export const { setCredentials, setUser, logout, updateUser } = authSlice.actions
export default authSlice.reducer
