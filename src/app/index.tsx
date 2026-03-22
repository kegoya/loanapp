import { Link } from "expo-router";
import {
  ArrowRight,
  LayoutDashboard,
  Plus,
  Settings as SettingsIcon,
  TrendingUp,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Dashboard() {
  const { isDark } = useTheme();

  // Stats set to your elegant starting values
  const [stats] = useState({
    totalLoaned: 125400,
    totalInterest: 18200,
    activeBorrowers: 3,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-16"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2563eb"
        />
      }
    >
      {/* Header Section */}
      <View className="flex-row justify-between items-center mb-10">
        <View className="flex-row items-center">
          <View className="bg-primary/10 p-2.5 rounded-2xl mr-3">
            <LayoutDashboard size={22} color="#2563eb" />
          </View>
          <Text className="text-foreground font-black text-2xl tracking-tighter">
            LoanManager
          </Text>
        </View>
        <Link href="/settings" asChild>
          <TouchableOpacity className="bg-card border border-border w-12 h-12 items-center justify-center rounded-2xl shadow-sm">
            <SettingsIcon color={isDark ? "#94a3b8" : "#64748b"} size={20} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Hero Portfolio - The "Classy" Big Text */}
      <View className="mb-10">
        <Text className="text-slate-500 font-bold text-[11px] uppercase tracking-[4px] mb-2 ml-1">
          Active Portfolio
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-foreground text-5xl font-black tracking-tighter">
            Ksh {stats.totalLoaned.toLocaleString()}
          </Text>
          <Link href="/add-loan" asChild>
            <TouchableOpacity className="bg-primary w-14 h-14 rounded-[22px] items-center justify-center shadow-xl shadow-blue-500/40">
              <Plus color="white" size={32} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Stats Grid with Glassmorphism feel */}
      <View className="flex-row gap-4 mb-10">
        <View className="flex-1 bg-card border border-border p-6 rounded-[35px] shadow-sm">
          <View className="bg-emerald-500/10 self-start p-2 rounded-xl mb-4">
            <TrendingUp size={20} color="#10b981" />
          </View>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
            Interest
          </Text>
          <Text className="text-foreground text-xl font-black tracking-tight">
            Ksh {stats.totalInterest.toLocaleString()}
          </Text>
        </View>

        <View className="flex-1 bg-card border border-border p-6 rounded-[35px] shadow-sm">
          <View className="bg-blue-500/10 self-start p-2 rounded-xl mb-4">
            <Users size={20} color="#2563eb" />
          </View>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
            Borrowers
          </Text>
          <Text className="text-foreground text-xl font-black tracking-tight">
            {stats.activeBorrowers}
          </Text>
        </View>
      </View>

      {/* Call to Action Card */}
      <Link href="/add-borrower" asChild>
        <TouchableOpacity className="bg-primary/5 border border-primary/10 p-6 rounded-[35px] mb-12 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-primary p-3.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <Plus size={22} color="white" />
            </View>
            <View className="ml-5">
              <Text className="text-foreground font-bold text-lg tracking-tight">
                Register Client
              </Text>
              <Text className="text-slate-500 text-xs font-medium">
                Add a new borrower to system
              </Text>
            </View>
          </View>
          <ArrowRight size={20} color="#2563eb" />
        </TouchableOpacity>
      </Link>

      {/* Recent Activity Label */}
      <View className="flex-row justify-between items-center mb-6 px-1">
        <Text className="text-foreground text-2xl font-black tracking-tighter">
          Recent Activity
        </Text>
        <TouchableOpacity>
          <Text className="text-primary font-bold text-xs uppercase tracking-widest">
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Empty State / Bottom Spacer for elegance */}
      <View className="items-center py-10 opacity-20">
        <View className="w-12 h-1 bg-slate-400 rounded-full" />
      </View>
    </ScrollView>
  );
}
