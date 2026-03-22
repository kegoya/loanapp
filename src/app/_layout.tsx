import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import { CustomSplashScreen } from "../components/SplashScreen";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { migrateDbIfNeeded } from "../db/database";

// Keep native splash visible until our logic takes over
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {/* We wrap the app in a sub-component so useTheme() can be called safely */}
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      {/* This fixes the invisible top status bar in dark mode */}
      <StatusBar style={isDark ? "light" : "dark"} />
      <SQLiteProvider
        databaseName="loan_manager_v2.db"
        onInit={migrateDbIfNeeded}
      >
        <MainLayout />
      </SQLiteProvider>
    </>
  );
}

function MainLayout() {
  const { isDark } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);

  // Animation controller for the custom splash screen fade-out
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Minimum delay for branding and DB initialization
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 2. Render the actual app content behind the splash
        setAppIsReady(true);

        // 3. Smoothly fade out the splash screen
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          // 4. Remove splash from DOM once hidden
          setSplashVisible(false);
        });
      } catch (e) {
        console.warn("Preparation Error:", e);
      } finally {
        // Hide the native white/stock splash screen
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fadeAnim]);

  return (
    <View
      className={`flex-1 ${isDark ? "dark" : ""}`}
      style={{ backgroundColor: isDark ? "#020617" : "#ffffff" }}
    >
      {/* App Stack Content */}
      {appIsReady && (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-borrower"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="add-loan"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="borrower/[id]"
            options={{ animation: "slide_from_right", gestureEnabled: true }}
          />
        </Stack>
      )}

      {/* Animated Overlay Splash Screen */}
      {splashVisible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <CustomSplashScreen opacity={fadeAnim} />
        </View>
      )}
    </View>
  );
}
