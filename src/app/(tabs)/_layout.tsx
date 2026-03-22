import { Tabs } from "expo-router";
import { LayoutDashboard, PieChart, Users } from "lucide-react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Define colors based on theme
  const activeColor = "#2563eb"; // primary blue
  const inactiveColor = isDark ? "#64748b" : "#94a3b8";
  const bgColor = isDark ? "#020617" : "#ffffff";
  const borderColor = isDark ? "#1e293b" : "#f1f5f9";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          elevation: 0,
          //height: Platform.OS === "ios" ? 88 : 65,
          //paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* 1. Dashboard Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={24} color={color} />
          ),
        }}
      />

      {/* 2. Borrowers Directory Tab */}
      <Tabs.Screen
        name="borrowers"
        options={{
          title: "Borrowers",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />

      {/* 3. Reports/Explore Tab */}
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <PieChart size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
