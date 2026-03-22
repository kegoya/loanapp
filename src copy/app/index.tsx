import { Link } from "expo-router";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  MessageCircle,
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
import { MOCK_BORROWERS } from "../db/mockData";

export default function Dashboard() {
  const { isDark } = useTheme();

  const [stats] = useState({
    totalLoaned: 125400,
    totalInterest: 18200,
    activeBorrowers: MOCK_BORROWERS.length,
  });

  const [loanList, setLoanList] = useState(MOCK_BORROWERS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "PAID":
        return { color: "bg-emerald-500", label: "Settled" };
      case "PARTIAL":
        return { color: "bg-amber-500", label: "Pending" };
      default:
        return { color: "bg-red-500", label: "Overdue" };
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-14"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchDashboardData}
          tintColor="#2563eb"
        />
      }
    >
      {/* Top Identity Row */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center">
          <View className="bg-primary/10 p-2 rounded-xl mr-3">
            <LayoutDashboard size={20} color="#2563eb" />
          </View>
          <Text className="text-foreground font-black text-xl tracking-tighter">
            LoanManager
          </Text>
        </View>
        <Link href="/settings" asChild>
          <TouchableOpacity className="p-2">
            <SettingsIcon color={isDark ? "#94a3b8" : "#64748b"} size={22} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Hero Portfolio Section */}
      <View className="mb-8">
        <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-[3px] mb-1 ml-1">
          Active Portfolio
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-foreground text-5xl font-black tracking-tighter">
            Ksh {stats.totalLoaned.toLocaleString()}
          </Text>
          <Link href="/add-loan" asChild>
            <TouchableOpacity className="bg-primary w-14 h-14 rounded-2xl items-center justify-center shadow-xl shadow-blue-500/40">
              <Plus color="white" size={28} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-row gap-4 mb-10">
        <View className="flex-1 bg-card border border-border p-5 rounded-[32px] shadow-sm">
          <View className="bg-emerald-500/10 self-start p-2 rounded-lg mb-3">
            <TrendingUp size={18} color="#10b981" />
          </View>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">
            Interest
          </Text>
          <Text className="text-foreground text-lg font-black">
            Ksh {stats.totalInterest.toLocaleString()}
          </Text>
        </View>
        <View className="flex-1 bg-card border border-border p-5 rounded-[32px] shadow-sm">
          <View className="bg-blue-500/10 self-start p-2 rounded-lg mb-3">
            <Users size={18} color="#2563eb" />
          </View>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">
            Borrowers
          </Text>
          <Text className="text-foreground text-lg font-black">
            {stats.activeBorrowers}
          </Text>
        </View>
      </View>

      {/* Quick Access Card */}
      <Link href="/add-borrower" asChild>
        <TouchableOpacity className="bg-primary/5 border border-primary/20 p-5 rounded-3xl mb-10 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-primary p-3 rounded-2xl">
              <Plus size={20} color="white" />
            </View>
            <View className="ml-4">
              <Text className="text-foreground font-bold text-lg">
                New Client
              </Text>
              <Text className="text-slate-500 text-xs">
                Register a new borrower profile
              </Text>
            </View>
          </View>
          <ArrowRight size={20} color="#2563eb" />
        </TouchableOpacity>
      </Link>

      {/* Live Feed Section */}
      <View className="mb-24">
        <View className="flex-row justify-between items-end mb-6 px-1">
          <Text className="text-foreground text-2xl font-black tracking-tight">
            Recent Activity
          </Text>
          <Text className="text-primary font-bold text-xs uppercase tracking-widest">
            View All
          </Text>
        </View>

        {loanList.map((loan) => {
          const status = getStatusDetails(loan.status);
          return (
            <TouchableOpacity
              key={loan.id}
              className="bg-card border border-border p-5 rounded-[32px] flex-row items-center justify-between shadow-sm mb-4"
            >
              <View className="flex-row items-center flex-1">
                <View
                  className={`w-2 h-10 rounded-full mr-4 ${status.color}`}
                />
                <View>
                  <Text className="text-foreground font-extrabold text-lg tracking-tight">
                    {loan.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-slate-500 text-xs font-medium">
                      Ksh {loan.totalBorrowed.toLocaleString()}
                    </Text>
                    <View className="w-1 h-1 bg-slate-300 rounded-full mx-2" />
                    <Text
                      className={`text-[10px] font-bold uppercase ${status.color.replace("bg-", "text-")}`}
                    >
                      {status.label}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                  <MessageCircle
                    size={20}
                    color={isDark ? "#94a3b8" : "#64748b"}
                  />
                </TouchableOpacity>
                <TouchableOpacity className="bg-primary p-3 rounded-2xl">
                  <CheckCircle2 size={20} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
