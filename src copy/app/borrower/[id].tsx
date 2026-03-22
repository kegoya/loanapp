import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  History,
  MessageCircle,
  Phone,
  TrendingUp,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { MOCK_BORROWERS } from "../../db/mockData";

export default function BorrowerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();

  // 1. Find the borrower from our mock data
  const initialBorrower = MOCK_BORROWERS.find((b) => b.id.toString() === id);

  // 2. Local state to handle "Mark as Paid" updates without a DB
  const [loans, setLoans] = useState([
    {
      id: 101,
      amount: 5000,
      total: 6000,
      status: "Not Paid",
      date: "2024-03-15",
    },
    { id: 102, amount: 2000, total: 2400, status: "Paid", date: "2024-02-10" },
  ]);

  // 3. Dynamic Stats Calculation
  const stats = useMemo(() => {
    const totalOwed = loans.reduce((acc, curr) => acc + curr.total, 0);
    const totalPaid = loans.reduce(
      (acc, curr) => (curr.status === "Paid" ? acc + curr.total : acc),
      0,
    );
    const totalDebt = totalOwed - totalPaid;
    const percentage = totalOwed > 0 ? (totalPaid / totalOwed) * 100 : 0;

    return { totalOwed, totalPaid, totalDebt, percentage };
  }, [loans]);

  const markAsPaid = (loanId: number) => {
    Alert.alert("Confirm Payment", "Mark this specific loan as settled?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => {
          setLoans((prev) =>
            prev.map((l) => (l.id === loanId ? { ...l, status: "Paid" } : l)),
          );
        },
      },
    ]);
  };

  if (!initialBorrower) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-foreground text-lg">Borrower not found.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary p-4 rounded-xl"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-14"
      showsVerticalScrollIndicator={false}
    >
      {/* Navigation Header */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-6 flex-row items-center"
      >
        <ArrowLeft size={20} color={isDark ? "#94a3b8" : "#64748b"} />
        <Text className="ml-2 text-slate-500 font-medium">Dashboard</Text>
      </TouchableOpacity>

      <Text className="text-foreground text-4xl font-black tracking-tight">
        {initialBorrower.name}
      </Text>
      <Text className="text-slate-500 mb-8 font-medium">
        M-Pesa: {initialBorrower.phone}
      </Text>

      {/* Action Hub */}
      <View className="flex-row gap-3 mb-8">
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${initialBorrower.phone}`)}
          className="flex-1 flex-row items-center justify-center bg-card border border-border p-5 rounded-3xl"
        >
          <Phone size={20} color="#2563eb" />
          <Text className="ml-2 text-foreground font-bold">Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`whatsapp://send?phone=${initialBorrower.phone}`)
          }
          className="flex-1 flex-row items-center justify-center bg-green-500 p-5 rounded-3xl"
        >
          <MessageCircle size={20} color="white" />
          <Text className="ml-2 text-white font-bold">WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Visual Repayment Tracker */}
      <View className="bg-card border border-border p-6 rounded-[40px] mb-6 shadow-sm">
        <View className="flex-row justify-between items-end mb-4">
          <View>
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-[2px] mb-1">
              Repayment Status
            </Text>
            <Text className="text-foreground text-2xl font-black">
              {Math.round(stats.percentage)}%{" "}
              <Text className="text-slate-400 text-sm font-medium">
                Settled
              </Text>
            </Text>
          </View>
        </View>

        {/* Custom Progress Bar */}
        <View className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${stats.percentage}%` }}
          />
        </View>

        <View className="flex-row items-center mt-4">
          <TrendingUp size={14} color="#16a34a" />
          <Text className="text-slate-500 text-xs ml-2 font-medium">
            Ksh {stats.totalPaid.toLocaleString()} paid of Ksh{" "}
            {stats.totalOwed.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Debt Highlight */}
      <View className="bg-primary p-8 rounded-[40px] mb-10 shadow-xl shadow-blue-500/40">
        <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest">
          Total Outstanding
        </Text>
        <Text className="text-white text-4xl font-black mt-2">
          Ksh {stats.totalDebt.toLocaleString()}
        </Text>
      </View>

      {/* Timeline */}
      <View className="pb-20">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <History size={20} color="#64748b" />
            <Text className="ml-2 text-foreground text-xl font-bold">
              Transaction History
            </Text>
          </View>
          <Text className="text-slate-400 text-xs">{loans.length} Loans</Text>
        </View>

        {loans.map((loan) => (
          <View
            key={loan.id}
            className="bg-card border border-border p-5 rounded-3xl mb-4 flex-row items-center justify-between shadow-sm"
          >
            <View>
              <Text className="text-foreground font-black text-lg">
                Ksh {loan.total.toLocaleString()}
              </Text>
              <Text className="text-slate-400 text-xs font-medium mt-0.5">
                {loan.date}
              </Text>
            </View>

            {loan.status === "Not Paid" ? (
              <TouchableOpacity
                onPress={() => markAsPaid(loan.id)}
                className="bg-amber-500 px-5 py-3 rounded-2xl flex-row items-center"
              >
                <Text className="text-white font-bold text-xs uppercase">
                  Pay Now
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-emerald-50 dark:bg-emerald-900/20 px-5 py-3 rounded-2xl flex-row items-center border border-emerald-100 dark:border-emerald-900/50">
                <CheckCircle2 size={14} color="#10b981" />
                <Text className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
                  Cleared
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
