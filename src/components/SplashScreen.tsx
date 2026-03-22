import React from "react";
import {
  ActivityIndicator,
  Animated, // Imported Animated
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

interface Props {
  opacity?: Animated.Value | number;
}

export function CustomSplashScreen({ opacity = 1 }: Props) {
  const { isDark } = useTheme();

  const bgColor = isDark ? "#020617" : "#ffffff";
  const iconColor = "#2563eb";

  return (
    // Changed View to Animated.View
    <Animated.View
      style={[styles.container, { backgroundColor: bgColor, opacity: opacity }]}
    >
      <View className="items-center justify-center">
        {/* Branding Icon */}
        <View className="mb-8 shadow-2xl shadow-blue-500/40">
          <Svg width={140} height={140} viewBox="0 0 24 24">
            <G
              fill="none"
              stroke={iconColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <Path d="M8 15l3-3 2 2 4-4" />
              <Path d="M13 10h4v4" />
            </G>
          </Svg>
        </View>

        {/* Textual Branding */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-black tracking-tighter text-foreground">
            LoanManager<Text className="text-blue-600">.</Text>
          </Text>
          <View className="flex-row items-center mt-2">
            <View className="h-[1.5px] w-6 bg-blue-600/20 dark:bg-blue-400/20 mr-3" />
            <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[5px]">
              MicroFinance
            </Text>
            <View className="h-[1.5px] w-6 bg-blue-600/20 dark:bg-blue-400/20 ml-3" />
          </View>
        </View>

        <ActivityIndicator size="small" color={iconColor} />
      </View>

      {/* Footer Meta */}
      <View className="absolute bottom-16 items-center">
        <Text className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[3px]">
          v1.0.0 • Secure Offline Vault
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
