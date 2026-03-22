import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ReportStats {
  totalPrincipal: number;
  totalInterest: number;
  totalCollected: number;
  totalPending: number;
  activeLoans: number;
  completedLoans: number;
}

export default function ExploreScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    totalPrincipal: 0,
    totalInterest: 0,
    totalCollected: 0,
    totalPending: 0,
    activeLoans: 0,
    completedLoans: 0,
  });

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.getAllAsync<{
        amount_loaned: number;
        total_repayment: number;
        status: string;
      }>("SELECT amount_loaned, total_repayment, status FROM loans");

      let principal = 0,
        interest = 0,
        collected = 0,
        pending = 0,
        active = 0,
        completed = 0;

      data.forEach((loan) => {
        principal += loan.amount_loaned;
        interest += loan.total_repayment - loan.amount_loaned;
        if (loan.status === "Paid") {
          collected += loan.total_repayment;
          completed++;
        } else {
          pending += loan.total_repayment;
          active++;
        }
      });

      setStats({
        totalPrincipal: principal,
        totalInterest: interest,
        totalCollected: collected,
        totalPending: pending,
        activeLoans: active,
        completedLoans: completed,
      });
    } catch (error) {
      console.error("Error generating reports:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports]),
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const collectionRate =
    stats.activeLoans + stats.completedLoans > 0
      ? (stats.completedLoans / (stats.activeLoans + stats.completedLoans)) *
        100
      : 0;

  const metrics = [
    {
      label: "Total Disbursed",
      value: `Ksh ${stats.totalPrincipal.toLocaleString()}`,
      icon: Wallet,
      color: "#2563eb",
    },
    {
      label: "Active Debt",
      value: `Ksh ${stats.totalPending.toLocaleString()}`,
      icon: AlertTriangle,
      color: "#f59e0b",
    },
    {
      label: "Interest Earned",
      value: `Ksh ${stats.totalInterest.toLocaleString()}`,
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
        <Text className="text-xl font-bold text-foreground">Analytics</Text>
      </View>

      <View className="p-6">
        {/* Portfolio Health Card */}
        <View className="bg-primary p-6 rounded-[40px] mb-8 shadow-xl shadow-blue-500/30">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest">
                Collection Rate
              </Text>
              <Text className="text-white text-4xl font-black mt-1">
                {Math.round(collectionRate)}%
              </Text>
            </View>
            <View className="bg-white/20 p-2 rounded-full">
              <ArrowUpRight size={24} color="white" />
            </View>
          </View>
          <Text className="text-blue-100/80 text-[10px] mt-4 font-medium uppercase tracking-tighter">
            Real-time repayment efficiency
          </Text>
        </View>

        {/* Stats Grid */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
          Key Metrics
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          {metrics.map((item, index) => (
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

        {/* Trend Visualizer */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
          Visual Breakdown
        </Text>
        <View className="bg-card border border-border p-6 rounded-3xl mb-8">
          <View className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-row">
            <View
              style={{ width: `${collectionRate}%` }}
              className="h-full bg-green-500"
            />
            <View
              style={{ width: `${100 - collectionRate}%` }}
              className="h-full bg-amber-500"
            />
          </View>
          <View className="flex-row justify-between mt-4">
            <Text className="text-[10px] text-green-600 font-bold uppercase">
              Paid ({stats.completedLoans})
            </Text>
            <Text className="text-[10px] text-amber-600 font-bold uppercase">
              Active ({stats.activeLoans})
            </Text>
          </View>
        </View>

        {/* Export Options */}
        <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4 ml-1">
          Actions
        </Text>
        <View className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-border">
            <View className="flex-row items-center">
              <Calendar size={18} color="#64748b" />
              <Text className="ml-3 text-foreground font-semibold">
                Generate Statement
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
