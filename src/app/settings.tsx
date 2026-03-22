import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  ArrowLeft,
  Monitor,
  Moon,
  Percent,
  Save,
  ShieldCheck,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

// --- Helper Component: Theme Preview ---
const ThemePreview = ({ isDark }: { isDark: boolean }) => (
  <View className="mb-8">
    <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4">
      Live Preview
    </Text>
    <View className="bg-card border border-border rounded-3xl p-5 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-slate-500 text-xs font-medium uppercase">
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
          <Text className="text-white font-bold text-sm text-center">
            New Loan
          </Text>
        </View>
      </View>

      <View className="mt-4 pt-4 border-t border-border flex-row justify-center">
        <Text className="text-[10px] text-slate-400 italic">
          Currently simulating {isDark ? "Dark Mode" : "Light Mode"}
        </Text>
      </View>
    </View>
  </View>
);

export default function Settings() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { themeMode, setTheme, isDark } = useTheme();

  const [limit, setLimit] = useState("");
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const limitRes = await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM settings WHERE key = 'default_loan_limit'",
        );
        const interestRes = await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM settings WHERE key = 'default_interest_rate'",
        );

        if (limitRes) setLimit(limitRes.value);
        if (interestRes)
          setInterest((parseFloat(interestRes.value) * 100).toString());
      } catch (e) {
        console.error("Failed to load settings from DB");
      }
    }
    loadSettings();
  }, [db]);

  const handleSaveDbSettings = async () => {
    setLoading(true);
    try {
      const interestDecimal = (parseFloat(interest) / 100).toString();
      await db.runAsync(
        "UPDATE settings SET value = ? WHERE key = 'default_loan_limit'",
        [limit],
      );
      await db.runAsync(
        "UPDATE settings SET value = ? WHERE key = 'default_interest_rate'",
        [interestDecimal],
      );
      Alert.alert("Success", "Lending configuration updated!");
    } catch (e) {
      Alert.alert("Error", "Failed to save settings.");
    } finally {
      setLoading(false);
    }
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

        <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4">
          Lending Configuration
        </Text>
        <View className="bg-card border border-border rounded-3xl p-4 mb-8">
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
              placeholder="5000"
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
              placeholder="20"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            onPress={handleSaveDbSettings}
            disabled={loading}
            className="bg-primary p-4 rounded-2xl flex-row justify-center items-center"
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

        <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4">
          Appearance
        </Text>
        <View className="bg-card border border-border rounded-3xl overflow-hidden mb-8">
          {themeOptions.map((option, index) => {
            const Icon = option.icon;
            const isActive = themeMode === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => requestAnimationFrame(() => setTheme(option.id))}
                className={`flex-row items-center justify-between p-4 ${
                  index !== themeOptions.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`p-2 rounded-lg ${isActive ? "bg-primary/10" : "bg-slate-100 dark:bg-slate-800"}`}
                  >
                    <Icon size={18} color={isActive ? "#2563eb" : "#64748b"} />
                  </View>
                  <Text
                    className={`ml-3 font-bold ${isActive ? "text-foreground" : "text-slate-500"}`}
                  >
                    {option.label}
                  </Text>
                </View>
                {isActive && (
                  <View className="w-2 h-2 rounded-full bg-primary" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
