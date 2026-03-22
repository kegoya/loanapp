import { Link, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Plus,
  Settings as SettingsIcon,
  TrendingUp,
  Users,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface LoanRecord {
  loan_id: number;
  borrower_id: number;
  name: string;
  phone: string;
  amount_loaned: number;
  total_repayment: number;
  status: string;
  loan_limit: number;
}

export default function Dashboard() {
  const db = useSQLiteContext();
  const { isDark } = useTheme();

  const [stats, setStats] = useState({
    totalLoaned: 0,
    totalInterest: 0,
    activeBorrowers: 0,
  });
  const [loanList, setLoanList] = useState<LoanRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Logic to determine risk based on loan vs limit
  const getRiskColor = (repayment: number, limit: number, status: string) => {
    if (status === "Paid") return "bg-emerald-500";
    if (!limit || limit <= 0) return "bg-slate-400";

    const ratio = repayment / limit;
    if (ratio > 0.85) return "bg-red-500"; // High Risk
    if (ratio > 0.5) return "bg-amber-500"; // Moderate
    return "bg-emerald-500"; // Low Risk
  };

  const fetchDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Totals
      const loanTotals = await db.getFirstAsync<{
        total: number;
        total_rep: number;
      }>(
        "SELECT SUM(amount_loaned) as total, SUM(total_repayment) as total_rep FROM loans",
      );

      // 2. Fetch Count of Users
      const userCount = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM users",
      );

      // 3. Fetch Recent Loans with User Join
      const results = await db.getAllAsync<LoanRecord>(`
        SELECT 
          l.loan_id, u.id AS borrower_id, u.name, u.phone, u.loan_limit,
          l.amount_loaned, l.total_repayment, l.status
        FROM loans l
        JOIN users u ON l.borrower_id = u.id
        ORDER BY l.loan_id DESC LIMIT 10
      `);

      const totalLoaned = loanTotals?.total ?? 0;
      const totalRepayment = loanTotals?.total_rep ?? 0;

      setStats({
        totalLoaned,
        totalInterest: totalRepayment - totalLoaned, // Accurate interest calculation
        activeBorrowers: userCount?.count ?? 0,
      });
      setLoanList(results);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData]),
  );

  const markAsPaid = async (loanId: number) => {
    Alert.alert("Confirm Payment", "Mark this loan as fully settled?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          await db.runAsync("UPDATE loans SET status = ? WHERE loan_id = ?", [
            "Paid",
            loanId,
          ]);
          fetchDashboardData();
        },
      },
    ]);
  };

  const sendWhatsApp = (phone: string, name: string, total: number) => {
    const message = `Hello ${name}, this is a reminder for your loan of Ksh ${total.toLocaleString()}.`;
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "WhatsApp is not installed."),
    );
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
      {/* Header Section */}
      <View className="flex-row justify-between items-end mb-8">
        <View>
          <Text className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">
            Portfolio Volume
          </Text>
          <Text className="text-foreground text-5xl font-black">
            Ksh {stats.totalLoaned.toLocaleString()}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Link href="/settings" asChild>
            <TouchableOpacity className="bg-card border border-border p-4 rounded-3xl shadow-sm">
              <SettingsIcon color={isDark ? "#94a3b8" : "#64748b"} size={22} />
            </TouchableOpacity>
          </Link>
          <Link href="/add-loan" asChild>
            <TouchableOpacity className="bg-primary p-4 rounded-3xl shadow-xl shadow-blue-500/30">
              <Plus color="white" size={22} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="flex-row gap-4 mb-8">
        <View className="flex-1 bg-card border border-border p-6 rounded-[32px]">
          <View className="bg-green-50 dark:bg-green-900/20 self-start p-2 rounded-xl mb-3">
            <TrendingUp size={18} color="#16a34a" />
          </View>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Expected Profit
          </Text>
          <Text className="text-foreground text-lg font-black mt-1">
            Ksh {stats.totalInterest.toLocaleString()}
          </Text>
        </View>
        <View className="flex-1 bg-card border border-border p-6 rounded-[32px]">
          <View className="bg-blue-50 dark:bg-blue-900/20 self-start p-2 rounded-xl mb-3">
            <Users size={18} color="#2563eb" />
          </View>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Active Clients
          </Text>
          <Text className="text-foreground text-lg font-black mt-1">
            {stats.activeBorrowers}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text className="text-foreground text-xl font-black mb-4">
        Quick Actions
      </Text>
      <Link href="/add-borrower" asChild>
        <TouchableOpacity className="flex-row items-center justify-between bg-card p-5 rounded-3xl mb-10 border border-border shadow-sm">
          <View className="flex-row items-center">
            <View className="bg-blue-600 p-2.5 rounded-xl">
              <Plus size={20} color="white" />
            </View>
            <Text className="ml-4 text-foreground font-bold">
              Register New Borrower
            </Text>
          </View>
          <ArrowRight size={18} color="#94a3b8" />
        </TouchableOpacity>
      </Link>

      {/* Active Loans List */}
      <View className="mb-24">
        <Text className="text-foreground text-xl font-black mb-4">
          Recent Activity
        </Text>
        {loanList.length === 0 ? (
          <View className="bg-card border border-dashed border-border p-12 rounded-[40px] items-center">
            <Text className="text-slate-400 font-medium">
              No loans issued yet.
            </Text>
          </View>
        ) : (
          loanList.map((loan) => (
            <View key={loan.loan_id} className="mb-4">
              <Link href={`/borrower/${loan.borrower_id}`} asChild>
                <TouchableOpacity className="bg-card border border-border p-5 rounded-[32px] flex-row items-center justify-between shadow-sm">
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-2.5 h-2.5 rounded-full mr-4 ${getRiskColor(loan.total_repayment, loan.loan_limit, loan.status)}`}
                    />
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-lg leading-5">
                        {loan.name}
                      </Text>
                      <Text className="text-slate-500 text-xs mt-1">
                        Due: Ksh {loan.total_repayment.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() =>
                        sendWhatsApp(
                          loan.phone,
                          loan.name,
                          loan.total_repayment,
                        )
                      }
                      className="bg-green-500/10 p-3 rounded-2xl"
                    >
                      <MessageCircle size={20} color="#16a34a" />
                    </TouchableOpacity>
                    {loan.status !== "Paid" && (
                      <TouchableOpacity
                        onPress={() => markAsPaid(loan.loan_id)}
                        className="bg-primary p-3 rounded-2xl"
                      >
                        <CheckCircle2 size={20} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              </Link>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
