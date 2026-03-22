import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Banknote,
  Search,
  ShieldAlert,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
import { useTheme } from "../context/ThemeContext";
// Import your mock data
import { MOCK_BORROWERS } from "../db/mockData";

// Define local interface for the mock data structure
interface Borrower {
  id: number;
  name: string;
  phone: string;
  totalBorrowed: number;
  status: string;
}

export default function AddLoan() {
  const router = useRouter();
  const { isDark } = useTheme();

  // --- Mock Data State ---
  // Using a default limit of 10,000 for all mock users for now
  const MOCK_LIMIT = 10000;

  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("0");
  const [total, setTotal] = useState("0");
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Interest Calculation Logic
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      const calcInterest = numAmount * 0.2; // Your 20% Interest Rule
      setInterest(calcInterest.toLocaleString());
      setTotal((numAmount + calcInterest).toLocaleString());
    } else {
      setInterest("0");
      setTotal("0");
    }
  }, [amount]);

  const filteredBorrowers = MOCK_BORROWERS.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery),
  );

  const handleIssueLoan = () => {
    const numAmount = parseFloat(amount);
    if (!selectedBorrower || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert(
        "Missing Info",
        "Select a borrower and enter a valid amount.",
      );
      return;
    }

    const numTotalRepayment = numAmount + numAmount * 0.2;
    const projectedDebt =
      (selectedBorrower.totalBorrowed || 0) + numTotalRepayment;

    // Safety Check using Mock Limit
    if (projectedDebt > MOCK_LIMIT) {
      Alert.alert(
        "Loan Limit Exceeded",
        `${selectedBorrower.name} has a limit of Ksh ${MOCK_LIMIT.toLocaleString()}.\n\n` +
          `Current Debt: Ksh ${selectedBorrower.totalBorrowed.toLocaleString()}\n` +
          `New Loan: Ksh ${numTotalRepayment.toLocaleString()}\n\n` +
          `This would exceed their limit.`,
        [{ text: "Adjust Amount" }],
      );
      return;
    }

    Alert.alert(
      "Success",
      `Loan of Ksh ${numAmount.toLocaleString()} issued to ${selectedBorrower.name}`,
      [{ text: "Done", onPress: () => router.back() }],
    );
  };

  return (
    <View className="flex-1 bg-background px-6 pt-14">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Navigation */}
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

        {/* BORROWER SELECTION */}
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
                {selectedBorrower && (
                  <Text className="text-slate-500 text-xs">
                    Current Debt: Ksh{" "}
                    {selectedBorrower.totalBorrowed.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
            <Search size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* LIMIT WARNING CARD */}
        {selectedBorrower && (
          <View className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl mb-6 flex-row items-center">
            <ShieldAlert size={20} color="#d97706" />
            <View className="ml-3 flex-1">
              <Text className="text-amber-800 dark:text-amber-500 text-xs font-bold uppercase tracking-wider">
                Available Credit
              </Text>
              <Text className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                Ksh{" "}
                {(MOCK_LIMIT - selectedBorrower.totalBorrowed).toLocaleString()}{" "}
                remaining
              </Text>
            </View>
          </View>
        )}

        {/* AMOUNT INPUT */}
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
              autoFocus={false}
            />
          </View>
        </View>

        {/* SUMMARY CARD */}
        <View className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-3xl mb-8">
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-500 font-medium">Interest (20%)</Text>
            <Text className="text-foreground font-bold text-lg">
              Ksh {interest}
            </Text>
          </View>
          <View className="h-[1px] bg-slate-200 dark:bg-slate-800 mb-4" />
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground font-bold">Total Repayment</Text>
            <Text className="text-blue-600 dark:text-blue-400 text-2xl font-black">
              Ksh {total}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleIssueLoan}
          className="bg-primary p-5 rounded-2xl items-center justify-center shadow-xl shadow-blue-500/20 active:opacity-80"
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
              placeholder="Search by name or phone..."
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-2 text-foreground font-medium"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <FlatList
            data={filteredBorrowers}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
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
