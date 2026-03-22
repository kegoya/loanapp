import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

export function CustomSplashScreen() {
  const { isDark } = useTheme();

  // Ensuring these match your tailwind 'background' and 'primary' colors
  const bgColor = isDark ? "#020617" : "#ffffff";
  const iconColor = "#2563eb";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View className="items-center justify-center">
        {/* Branding Icon */}
        <View className="mb-8 shadow-2xl shadow-blue-500/20">
          <Svg width={120} height={120} viewBox="0 0 24 24">
            <G
              fill="none"
              stroke={iconColor}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer Shield */}
              <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              {/* Internal Growth Line (Trending Up) */}
              <Path d="M8 15l3-3 2 2 4-4" />
              <Path d="M13 10h4v4" />
            </G>
          </Svg>
        </View>

        {/* Textual Branding */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-black tracking-tighter text-foreground">
            LoanManager
          </Text>
          <View className="flex-row items-center mt-1">
            <View className="h-[1px] w-4 bg-slate-300 dark:bg-slate-700 mr-2" />
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-[4px]">
              MicroFinance
            </Text>
            <View className="h-[1px] w-4 bg-slate-300 dark:bg-slate-700 ml-2" />
          </View>
        </View>

        <ActivityIndicator size="small" color={iconColor} />
      </View>

      {/* Footer Meta */}
      <View className="absolute bottom-16 items-center">
        <Text className="text-slate-400 dark:text-slate-600 text-[9px] font-bold uppercase tracking-[2px]">
          v1.0.0 • Local Secure Storage
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
