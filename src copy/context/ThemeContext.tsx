import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

// Define the three possible modes
type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean; // The actual boolean used for styling
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme(); // Detects 'light' or 'dark' from the phone
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  // Load the user's saved preference on app launch
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("user-theme");
        if (saved) {
          setThemeMode(saved as ThemeMode);
        }
      } catch (e) {
        console.error("Failed to load theme from storage", e);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem("user-theme", mode);
    } catch (e) {
      console.error("Failed to save theme preference", e);
    }
  };

  /**
   * THE LOGIC:
   * 1. If mode is 'system', we use whatever the phone says (systemColorScheme).
   * 2. Otherwise, we use the manual 'dark' choice.
   */
  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
