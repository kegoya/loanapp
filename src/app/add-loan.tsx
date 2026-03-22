import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  ArrowLeft,
  Banknote,
  Search,
  ShieldAlert,
  User,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// FIX: Path adjusted to go up one level from 'app' to 'context'
import { useTheme } from "../context/ThemeContext";

interface Borrower {
  id: number;
  name: string;
  phone: string;
  loan_limit: number;
  current_debt: number;
}

export default function AddLoan() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { isDark } = useTheme();

  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(
    null,
  );
  const [defaultInterest, setDefaultInterest] = useState(0.2);

  const [amount, setAmount] = useState("");
  const [interestVal, setInterestVal] = useState(0);
  const [totalVal, setTotalVal] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadInitialData = useCallback(async () => {
    try {
      const userResults = await db.getAllAsync<Borrower>(`
        SELECT 
          u.id, u.name, u.phone, u.loan_limit,
          COALESCE(SUM(CASE WHEN l.status = 'Not Paid' THEN l.total_repayment ELSE 0 END), 0) as current_debt
        FROM users u
        LEFT JOIN loans l ON u.id = l.borrower_id
        GROUP BY u.id
      `);
      setBorrowers(userResults);

      const interestSetting = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM settings WHERE key = 'default_interest_rate'",
      );
      if (interestSetting)
        setDefaultInterest(parseFloat(interestSetting.value));
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }, [db]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      const calcInterest = numAmount * defaultInterest;
      setInterestVal(calcInterest);
      setTotalVal(numAmount + calcInterest);
    } else {
      setInterestVal(0);
      setTotalVal(0);
    }
  }, [amount, defaultInterest]);

  const handleIssueLoan = async () => {
    const numAmount = parseFloat(amount);
    if (!selectedBorrower || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert(
        "Error",
        "Please select a borrower and enter a valid amount.",
      );
      return;
    }

    const projectedDebt = selectedBorrower.current_debt + totalVal;

    if (projectedDebt > selectedBorrower.loan_limit) {
      Alert.alert(
        "Limit Exceeded",
        `Total debt would be Ksh ${projectedDebt.toLocaleString()}.`,
      );
      return;
    }

    try {
      await db.runAsync(
        "INSERT INTO loans (borrower_id, amount_loaned, interest, total_repayment, status) VALUES (?, ?, ?, ?, ?)",
        [selectedBorrower.id, numAmount, defaultInterest, totalVal, "Not Paid"],
      );

      Alert.alert("Success", "Loan issued successfully!", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to save loan.");
    }
  };

  const filteredBorrowers = borrowers.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery),
  );

  return (
    <View className="flex-1 bg-background px-6 pt-14">
      {/* CRITICAL FIX: Everything is now correctly inside this ScrollView 
        or siblings of the ScrollView inside the parent View.
      */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 flex-row items-center"
        >
          <ArrowLeft size={20} color={isDark ? "#94a3b8" : "#64748b"} />
          <Text className="ml-2 text-slate-500 font-medium">Cancel</Text>
        </TouchableOpacity>

        <Text className="text-foreground text-3xl font-bold mb-8">
          Issue New Loan
        </Text>

        <View className="mb-6">
          <Text className="text-foreground font-medium mb-2 ml-1">
            Select Borrower
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-row items-center justify-between bg-card border border-border rounded-2xl px-4 py-4 shadow-sm"
          >
            <View className="flex-row items-center">
              <User
                size={20}
                color={selectedBorrower ? "#2563eb" : "#94a3b8"}
              />
              <View className="ml-3">
                <Text
                  className={`text-lg ${selectedBorrower ? "text-foreground font-bold" : "text-slate-400"}`}
                >
                  {selectedBorrower
                    ? selectedBorrower.name
                    : "Choose a person..."}
                </Text>
              </View>
            </View>
            <Search size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {selectedBorrower && (
          <View className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl mb-6 flex-row items-center">
            <ShieldAlert size={20} color="#d97706" />
            <View className="ml-3 flex-1">
              <Text className="text-amber-800 dark:text-amber-500 text-xs font-bold uppercase tracking-wider">
                Remaining Credit
              </Text>
              <Text className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                Ksh{" "}
                {(
                  selectedBorrower.loan_limit - selectedBorrower.current_debt
                ).toLocaleString()}{" "}
                available
              </Text>
            </View>
          </View>
        )}

        <View className="mb-8">
          <Text className="text-foreground font-medium mb-2 ml-1">
            Loan Amount (Ksh)
          </Text>
          <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-5 shadow-sm">
            <Banknote size={24} color="#16a34a" />
            <TextInput
              className="flex-1 ml-3 text-foreground text-2xl font-black"
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        <View className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-3xl mb-8">
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-500 font-medium">
              Interest ({Math.round(defaultInterest * 100)}%)
            </Text>
            <Text className="text-foreground font-bold text-lg">
              Ksh {interestVal.toLocaleString()}
            </Text>
          </View>
          <View className="h-[1px] bg-slate-200 dark:bg-slate-800 mb-4" />
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground font-bold">Total Repayment</Text>
            <Text className="text-blue-600 dark:text-blue-400 text-2xl font-black">
              Ksh {totalVal.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleIssueLoan}
          className="bg-primary p-5 rounded-2xl items-center justify-center shadow-xl shadow-blue-500/20 mb-10"
        >
          <Text className="text-white font-bold text-lg">
            Confirm & Issue Loan
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SEARCH MODAL */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-foreground">
              Select Borrower
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full"
            >
              <Text className="text-foreground font-bold">Close</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 mb-4 border border-border">
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search..."
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-2 text-foreground"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <FlatList
            data={filteredBorrowers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedBorrower(item);
                  setModalVisible(false);
                }}
                className="py-5 border-b border-border flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-foreground font-bold text-lg">
                    {item.name}
                  </Text>
                  <Text className="text-slate-500 text-sm">{item.phone}</Text>
                </View>
                <View className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <Text className="text-blue-600 text-xs font-bold">
                    Select
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
