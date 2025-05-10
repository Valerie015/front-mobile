"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper"
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from "@react-navigation/native"

// Define theme colors
const lightColors = {
  primary: "#F14647",
  onPrimary: "#FFFFFF",
  primaryContainer: "#FFECEC",
  onPrimaryContainer: "#410001",
  secondary: "#775656",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#FFDAD7",
  onSecondaryContainer: "#2C1516",
  tertiary: "#755A2F",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#FFDDAF",
  onTertiaryContainer: "#281800",
  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#410002",
  background: "#FFFBFF",
  onBackground: "#201A1A",
  surface: "#FFFBFF",
  onSurface: "#201A1A",
  surfaceVariant: "#F5DDDB",
  onSurfaceVariant: "#534342",
  outline: "#857371",
  outlineVariant: "#D8C2BF",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#362F2F",
  inverseOnSurface: "#FAEEEC",
  inversePrimary: "#FFB3B4",
  elevation: {
    level0: "transparent",
    level1: "#FFF8F7",
    level2: "#FFF1F0",
    level3: "#FFEAE9",
    level4: "#FFE9E8",
    level5: "#FFE4E3",
  },
  surfaceDisabled: "#201A1A61",
  onSurfaceDisabled: "#201A1A1F",
  backdrop: "#201A1A52",
  text: "#201A1A",
  border: "#D8C2BF",
}

const darkColors = {
  primary: "#FFB3B4",
  onPrimary: "#680012",
  primaryContainer: "#930023",
  onPrimaryContainer: "#FFDAD9",
  secondary: "#E7BDB9",
  onSecondary: "#442A29",
  secondaryContainer: "#5D3F3F",
  onSecondaryContainer: "#FFDAD7",
  tertiary: "#E5C18D",
  onTertiary: "#422C05",
  tertiaryContainer: "#5B421A",
  onTertiaryContainer: "#FFDDAF",
  error: "#FFB4AB",
  onError: "#690005",
  errorContainer: "#93000A",
  onErrorContainer: "#FFDAD6",
  background: "#201A1A",
  onBackground: "#ECE0DE",
  surface: "#201A1A",
  onSurface: "#ECE0DE",
  surfaceVariant: "#534342",
  onSurfaceVariant: "#D8C2BF",
  outline: "#A08C8A",
  outlineVariant: "#534342",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#ECE0DE",
  inverseOnSurface: "#362F2F",
  inversePrimary: "#F14647",
  elevation: {
    level0: "transparent",
    level1: "#2A2222",
    level2: "#2F2626",
    level3: "#342A2A",
    level4: "#362C2C",
    level5: "#3A2E2E",
  },
  surfaceDisabled: "#ECE0DE61",
  onSurfaceDisabled: "#ECE0DE1F",
  backdrop: "#ECE0DE52",
  text: "#ECE0DE",
  border: "#534342",
}

// Create custom themes
const createCustomTheme = (isDark: boolean) => {
  const colors = isDark ? darkColors : lightColors
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...colors,
    },
    dark: isDark,
    // Add font configuration for React Native Paper
    fonts: {
      ...baseTheme.fonts,
      // You can customize these if needed
      regular: {
        fontFamily: "System",
        fontWeight: "normal",
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500",
      },
      light: {
        fontFamily: "System",
        fontWeight: "300",
      },
      thin: {
        fontFamily: "System",
        fontWeight: "100",
      },
    },
  }
}

// Create navigation theme
const createNavigationTheme = (isDark: boolean) => {
  const colors = isDark ? darkColors : lightColors

  return {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
    fonts: DefaultTheme.fonts,
  }
}

// Create theme context
type ThemeContextType = {
  theme: ReturnType<typeof createCustomTheme>
  colors: typeof lightColors
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(colorScheme === "dark")

  // Update theme when system theme changes
  useEffect(() => {
    setIsDark(colorScheme === "dark")
  }, [colorScheme])

  const theme = createCustomTheme(isDark)
  const navigationTheme = createNavigationTheme(isDark)
  const colors = isDark ? darkColors : lightColors

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme }}>
      <PaperProvider theme={theme}>
        <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

