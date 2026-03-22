import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  History,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Path adjusted for 3-level nesting: (tabs) -> borrower -> [id].tsx
import { useTheme } from "../../context/ThemeContext";

interface BorrowerDetails {
  name: string;
  phone: string;
  id_number: string;
  loan_limit: number;
}

interface LoanHistory {
  loan_id: number;
  amount_loaned: number;
  total_repayment: number;
  status: "Paid" | "Not Paid";
  created_at: string;
}

export default function BorrowerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [borrower, setBorrower] = useState<BorrowerDetails | null>(null);
  const [loans, setLoans] = useState<LoanHistory[]>([]);
  const [stats, setStats] = useState({
    totalOwed: 0,
    totalPaid: 0,
    currentUnpaid: 0,
    percentage: 0,
  });

  // CRITICAL FIX: Ensure ID is a single string/number for SQLite
  const borrowerId = Array.isArray(id) ? id[0] : id;

  const loadData = useCallback(async () => {
    if (!borrowerId) return;
    setLoading(true);
    try {
      // 1. Fetch Borrower Info
      const borrowerData = await db.getFirstAsync<BorrowerDetails>(
        "SELECT name, phone, id_number, loan_limit FROM users WHERE id = ?",
        [borrowerId],
      );
      setBorrower(borrowerData);

      // 2. Fetch Loan History
      const loanData = await db.getAllAsync<LoanHistory>(
        "SELECT loan_id, amount_loaned, total_repayment, status, created_at FROM loans WHERE borrower_id = ? ORDER BY loan_id DESC",
        [borrowerId],
      );
      setLoans(loanData);

      // 3. Calculate Stats
      let totalOwed = 0,
        totalPaid = 0,
        currentUnpaid = 0;

      loanData.forEach((loan) => {
        totalOwed += loan.total_repayment;
        if (loan.status === "Paid") {
          totalPaid += loan.total_repayment;
        } else {
          currentUnpaid += loan.total_repayment;
        }
      });

      setStats({
        totalOwed,
        totalPaid,
        currentUnpaid,
        percentage: totalOwed > 0 ? (totalPaid / totalOwed) * 100 : 0,
      });
    } catch (e) {
      console.error("Error loading borrower data:", e);
    } finally {
      setLoading(false);
    }
  }, [db, borrowerId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const markAsPaid = async (loanId: number) => {
    Alert.alert("Confirm Payment", "Mark this loan as fully settled?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            await db.runAsync("UPDATE loans SET status = ? WHERE loan_id = ?", [
              "Paid",
              loanId,
            ]);
            loadData();
          } catch (e) {
            Alert.alert("Error", "Failed to update payment.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!borrower) return null;

  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-12"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-6 flex-row items-center"
      >
        <ArrowLeft size={20} color={isDark ? "#94a3b8" : "#64748b"} />
        <Text className="ml-2 text-slate-500 font-medium">Back</Text>
      </TouchableOpacity>

      <View className="mb-8">
        <Text className="text-foreground text-3xl font-black">
          {borrower.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <ShieldCheck size={14} color="#64748b" />
          <Text className="text-slate-500 ml-1 text-xs">
            ID: {borrower.id_number}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-8">
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${borrower.phone}`)}
          className="flex-1 flex-row items-center justify-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800"
        >
          <Phone size={18} color="#2563eb" />
          <Text className="ml-2 text-blue-600 font-bold">Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`whatsapp://send?phone=${borrower.phone}`)
          }
          className="flex-1 flex-row items-center justify-center bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800"
        >
          <MessageCircle size={18} color="#16a34a" />
          <Text className="ml-2 text-green-600 font-bold">WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Debt Card */}
      <View className="bg-primary p-6 rounded-[40px] mb-8 shadow-xl shadow-blue-500/30">
        <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest">
          Outstanding Balance
        </Text>
        <Text className="text-white text-4xl font-black mt-2">
          Ksh {stats.currentUnpaid.toLocaleString()}
        </Text>
        <View className="mt-4 pt-4 border-t border-white/10 flex-row justify-between">
          <View>
            <Text className="text-blue-200 text-[10px] uppercase">
              Loan Limit
            </Text>
            <Text className="text-white font-bold text-sm">
              Ksh {borrower.loan_limit.toLocaleString()}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-blue-200 text-[10px] uppercase">
              Repayment Rate
            </Text>
            <Text className="text-white font-bold text-sm">
              {Math.round(stats.percentage)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Progress */}
      <View className="bg-card border border-border p-6 rounded-3xl mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-foreground font-bold">Lifetime Progress</Text>
          <Text className="text-slate-500 text-xs">
            Paid {Math.round(stats.percentage)}%
          </Text>
        </View>
        <View className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary"
            style={{ width: `${stats.percentage}%` }}
          />
        </View>
      </View>

      {/* History */}
      <View className="mb-20">
        <View className="flex-row items-center mb-4">
          <History size={20} color="#64748b" />
          <Text className="ml-2 text-foreground text-xl font-bold">
            Transaction History
          </Text>
        </View>

        {loans.length === 0 ? (
          <View className="bg-card border border-dashed border-border p-10 rounded-3xl items-center">
            <AlertCircle size={24} color="#94a3b8" />
            <Text className="text-slate-400 mt-2">No loans recorded yet</Text>
          </View>
        ) : (
          loans.map((loan) => (
            <View
              key={loan.loan_id}
              className="bg-card border border-border p-5 rounded-3xl mb-4 flex-row items-center justify-between shadow-sm"
            >
              <View>
                <Text className="text-foreground font-black text-lg">
                  Ksh {loan.total_repayment.toLocaleString()}
                </Text>
                <Text className="text-slate-500 text-xs">
                  Issued: {new Date(loan.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View
                  className={`px-3 py-1.5 rounded-xl ${loan.status === "Paid" ? "bg-green-50 dark:bg-green-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}
                >
                  <Text
                    className={`text-[10px] font-black uppercase ${loan.status === "Paid" ? "text-green-600" : "text-amber-600"}`}
                  >
                    {loan.status}
                  </Text>
                </View>
                {loan.status !== "Paid" && (
                  <TouchableOpacity
                    onPress={() => markAsPaid(loan.loan_id)}
                    className="bg-primary p-2.5 rounded-2xl"
                  >
                    <CheckCircle2 size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
