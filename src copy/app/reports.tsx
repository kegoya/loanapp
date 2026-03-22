import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  PieChart,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Reports() {
  const router = useRouter();
  const { isDark } = useTheme();

  // Mock Analytics Data
  const stats = [
    {
      label: "Total Disbursed",
      value: "Ksh 142,000",
      icon: Wallet,
      color: "#2563eb",
    },
    {
      label: "Active Debt",
      value: "Ksh 58,400",
      icon: AlertTriangle,
      color: "#f59e0b",
    },
    {
      label: "Interest Earned",
      value: "Ksh 28,400",
      icon: TrendingUp,
      color: "#16a34a",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-6 pt-14 pb-4 flex-row items-center border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={isDark ? "#f8fafc" : "#0f172a"} />
        </TouchableOpacity>
        <Text className="ml-2 text-xl font-bold text-foreground">
          Analytics
        </Text>
      </View>

      <View className="p-6">
        {/* Portfolio Health Card */}
        <View className="bg-primary p-6 rounded-[40px] mb-8 shadow-xl shadow-blue-500/30">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest">
                Collection Rate
              </Text>
              <Text className="text-white text-4xl font-black mt-1">84.2%</Text>
            </View>
            <View className="bg-white/20 p-2 rounded-full">
              <ArrowUpRight size={24} color="white" />
            </View>
          </View>
          <Text className="text-blue-100/80 text-[10px] mt-4 font-medium uppercase tracking-tighter">
            +5.2% from last month
          </Text>
        </View>

        {/* Stats Grid */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
          Key Metrics
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          {stats.map((item, index) => (
            <View
              key={index}
              className="w-[48%] bg-card border border-border p-5 rounded-3xl shadow-sm"
            >
              <View
                className="p-2 rounded-xl mb-3 self-start"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <item.icon size={20} color={item.color} />
              </View>
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-tight mb-1">
                {item.label}
              </Text>
              <Text
                className="text-foreground font-black text-lg"
                numberOfLines={1}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Performance Visualization (Mock Chart Area) */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
          Disbursement Trend
        </Text>
        <View className="bg-card border border-border p-6 rounded-3xl mb-8 items-center">
          {/* Simulated Chart Bars */}
          <View className="flex-row items-end justify-between w-full h-32 mb-4 px-2">
            {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
              <View key={i} className="items-center">
                <View
                  className="w-3 bg-primary/20 rounded-full"
                  style={{ height: "100%", position: "absolute", bottom: 0 }}
                />
                <View
                  className="w-3 bg-primary rounded-full"
                  style={{ height: `${height}%` }}
                />
              </View>
            ))}
          </View>
          <View className="flex-row justify-between w-full border-t border-border pt-4">
            <Text className="text-slate-400 text-[10px] font-bold uppercase">
              Jan
            </Text>
            <Text className="text-slate-400 text-[10px] font-bold uppercase">
              Mar
            </Text>
            <Text className="text-primary text-[10px] font-bold uppercase">
              Jul (Today)
            </Text>
          </View>
        </View>

        {/* Quick Reports List */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
          Export Data
        </Text>
        <View className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-border">
            <View className="flex-row items-center">
              <Calendar size={18} color="#64748b" />
              <Text className="ml-3 text-foreground font-semibold">
                Monthly Statement (PDF)
              </Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center">
              <PieChart size={18} color="#64748b" />
              <Text className="ml-3 text-foreground font-semibold">
                Borrower Risk Report
              </Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <Text className="text-center text-slate-400 text-[9px] mt-12 font-medium uppercase tracking-[3px]">
          Confidential • End-of-Day Summary
        </Text>
      </View>
    </ScrollView>
  );
}
