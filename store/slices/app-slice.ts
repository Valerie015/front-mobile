import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AppState {
  hasSeenOnboarding: boolean
  theme: "light" | "dark" | "system"
}

const initialState: AppState = {
  hasSeenOnboarding: false,
  theme: "system",
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setHasSeenOnboarding: (state, action: PayloadAction<boolean>) => {
      state.hasSeenOnboarding = action.payload
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload
    },
  },
})

export const { setHasSeenOnboarding, setTheme } = appSlice.actions
export default appSlice.reducer