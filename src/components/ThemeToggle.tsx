import * as Haptics from "expo-haptics";
import { Monitor, Moon, Sun } from "lucide-react-native";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Mode = "light" | "dark" | "system";

export function ThemeToggle() {
  const { themeMode, setTheme } = useTheme();

  const options: {
    id: Mode;
    icon: any;
    label: string;
  }[] = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "system", icon: Monitor, label: "System" },
    { id: "dark", icon: Moon, label: "Dark" },
  ];

  const handlePress = (mode: Mode) => {
    // Add a subtle haptic "click" on iOS/Android
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    requestAnimationFrame(() => {
      setTheme(mode);
    });
  };

  return (
    <View className="flex-row bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl self-center border border-slate-200 dark:border-slate-800">
      {options.map((opt) => {
        const isActive = themeMode === opt.id;
        const Icon = opt.icon;

        return (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.7}
            onPress={() => handlePress(opt.id)}
            className={`flex-row items-center px-5 py-2.5 rounded-xl ${
              isActive
                ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                : "bg-transparent"
            }`}
          >
            <Icon
              size={18}
              strokeWidth={isActive ? 2.5 : 2}
              color={isActive ? "#2563eb" : "#94a3b8"}
            />
            {isActive && (
              <Text className="ml-2.5 font-bold text-blue-600 dark:text-blue-400 text-sm">
                {opt.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
