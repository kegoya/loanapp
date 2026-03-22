import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Database,
  Monitor,
  Moon,
  Percent,
  Save,
  ShieldCheck,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

// --- Theme Preview Component ---
const ThemePreview = ({ isDark }: { isDark: boolean }) => (
  <View className="mb-8">
    <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
      Live Style Preview
    </Text>
    <View className="bg-card border border-border rounded-3xl p-5 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
            Portfolio Overview
          </Text>
          <Text className="text-foreground text-xl font-bold">Ksh 45,200</Text>
        </View>
        <View className="bg-primary/10 p-2 rounded-full">
          <TrendingUp size={20} color="#2563eb" />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 bg-background border border-border p-3 rounded-2xl items-center">
          <Users size={16} color="#64748b" />
          <Text className="text-foreground font-bold mt-1 text-sm">12</Text>
          <Text className="text-slate-500 text-[10px]">Borrowers</Text>
        </View>
        <View className="flex-1 bg-primary p-3 rounded-2xl items-center justify-center">
          <Text className="text-white font-bold text-xs text-center uppercase tracking-tighter">
            New Loan
          </Text>
        </View>
      </View>
    </View>
  </View>
);

export default function Settings() {
  const router = useRouter();
  const { themeMode, setTheme, isDark } = useTheme();

  // Initialize with your default values instead of DB fetch
  const [limit, setLimit] = useState("5000");
  const [interest, setInterest] = useState("20");
  const [loading, setLoading] = useState(false);

  const handleSaveDbSettings = () => {
    setLoading(true);
    // Simulate a successful DB write
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Lending configuration updated locally!");
    }, 800);
  };

  const themeOptions: {
    id: "light" | "dark" | "system";
    label: string;
    icon: any;
  }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "system", label: "System", icon: Monitor },
    { id: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 flex-row items-center border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={isDark ? "#f8fafc" : "#0f172a"} />
        </TouchableOpacity>
        <Text className="ml-2 text-xl font-bold text-foreground">Settings</Text>
      </View>

      <View className="p-6">
        <ThemePreview isDark={isDark} />

        {/* LENDING RULES SECTION */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
          Lending Configuration
        </Text>
        <View className="bg-card border border-border rounded-3xl p-4 mb-8 shadow-sm">
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <ShieldCheck size={18} color="#2563eb" />
              <Text className="ml-2 text-foreground font-semibold">
                Default Limit (Ksh)
              </Text>
            </View>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground font-bold"
              keyboardType="numeric"
              value={limit}
              onChangeText={setLimit}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Percent size={18} color="#16a34a" />
              <Text className="ml-2 text-foreground font-semibold">
                Default Interest (%)
              </Text>
            </View>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground font-bold"
              keyboardType="numeric"
              value={interest}
              onChangeText={setInterest}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            onPress={handleSaveDbSettings}
            disabled={loading}
            className={`bg-primary p-4 rounded-2xl flex-row justify-center items-center ${loading ? "opacity-70" : ""}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={18} color="white" />
                <Text className="text-white font-bold ml-2">Save Rules</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* APPEARANCE SECTION */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
          Appearance
        </Text>
        <View className="bg-card border border-border rounded-3xl overflow-hidden mb-8 shadow-sm">
          {themeOptions.map((option, index) => {
            const Icon = option.icon;
            const isActive = themeMode === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => setTheme(option.id)}
                className={`flex-row items-center justify-between p-5 ${
                  index !== themeOptions.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`p-2 rounded-xl ${isActive ? "bg-primary/10" : "bg-slate-100 dark:bg-slate-800"}`}
                  >
                    <Icon size={20} color={isActive ? "#2563eb" : "#64748b"} />
                  </View>
                  <Text
                    className={`ml-3 text-base ${isActive ? "font-bold text-foreground" : "text-slate-500"}`}
                  >
                    {option.label}
                  </Text>
                </View>
                {isActive && (
                  <View className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-blue-500" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SYSTEM SECTION */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
          System Tools
        </Text>
        <View className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <TouchableOpacity
            className="flex-row items-center justify-between p-5 border-b border-border"
            onPress={() =>
              Alert.alert("Backup", "CSV Export feature coming soon!")
            }
          >
            <View className="flex-row items-center">
              <Database size={20} color="#64748b" />
              <Text className="ml-3 text-foreground font-medium">
                Backup Database (CSV)
              </Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <Text className="text-center text-slate-400 text-[10px] mt-12 font-medium uppercase tracking-[3px]">
          LoanManager v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
