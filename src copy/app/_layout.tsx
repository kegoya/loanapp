import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import "../../global.css";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

// Keep the native splash screen visible until we tell it to hide
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}

function MainLayout() {
  const { isDark } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // We set a very short delay just to ensure the ThemeProvider has initialized
    const prepare = async () => {
      try {
        // You can add your DB check back here LATER once the white screen is gone
        setAppIsReady(true);
      } catch (e) {
        console.warn(e);
      } finally {
        // Force hide the splash screen immediately
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  // While initializing, we return null so the Native Splash Screen stays up.
  // This prevents the "White Flash" during the JS boot up.
  if (!appIsReady) {
    return null;
  }

  return (
    <View
      className={`flex-1 ${isDark ? "dark" : ""}`}
      style={{ backgroundColor: isDark ? "#020617" : "#ffffff" }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </View>
  );
}
