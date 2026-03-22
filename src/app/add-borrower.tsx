import { useFocusEffect, useRouter } from "expo-router"; // Updated for Expo Router
import { useSQLiteContext } from "expo-sqlite";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Edit3,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Borrower {
  id: number;
  name: string;
  phone: string;
  id_number: string;
  loan_limit: number;
}

export default function AddBorrower() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { isDark } = useTheme();

  // --- Form State ---
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [loanLimit, setLoanLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- List & Search State ---
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [search, setSearch] = useState("");

  // Load default limit from settings for new borrowers
  useEffect(() => {
    async function loadDefaultLimit() {
      if (!editingId) {
        try {
          const res = await db.getFirstAsync<{ value: string }>(
            "SELECT value FROM settings WHERE key = 'default_loan_limit'",
          );
          if (res) setLoanLimit(res.value);
        } catch (e) {
          console.log("Error loading default limit:", e);
        }
      }
    }
    loadDefaultLimit();
  }, [db, editingId]);

  const loadBorrowers = useCallback(async () => {
    try {
      const data = await db.getAllAsync<Borrower>(
        "SELECT id, name, phone, id_number, loan_limit FROM users ORDER BY id DESC",
      );
      setBorrowers(data);
    } catch (error) {
      console.error("Error loading borrowers:", error);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadBorrowers();
    }, [loadBorrowers]),
  );

  const handleSaveOrUpdate = async () => {
    if (!name || !phone || !idNumber || !loanLimit) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await db.runAsync(
          "UPDATE users SET name = ?, phone = ?, id_number = ?, loan_limit = ? WHERE id = ?",
          [name, phone, idNumber, parseFloat(loanLimit), editingId],
        );
        Alert.alert("Success", "Borrower details updated!");
      } else {
        await db.runAsync(
          "INSERT INTO users (name, phone, id_number, loan_limit, status) VALUES (?, ?, ?, ?, ?)",
          [name, phone, idNumber, parseFloat(loanLimit), "Approved"],
        );
        Alert.alert("Success", `${name} has been added!`);
      }

      cancelEdit();
      loadBorrowers();
    } catch (error: any) {
      console.error("Database Error:", error.message);
      if (error.message.includes("UNIQUE constraint")) {
        Alert.alert("Error", "This phone number or ID is already registered.");
      } else {
        Alert.alert("Database Error", "Action failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (person: Borrower) => {
    setEditingId(person.id);
    setName(person.name);
    setPhone(person.phone);
    setIdNumber(person.id_number);
    setLoanLimit(person.loan_limit.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setIdNumber("");
    Keyboard.dismiss();
  };

  const deleteBorrower = (id: number, borrowerName: string) => {
    Alert.alert(
      "Delete Borrower",
      `Are you sure you want to delete ${borrowerName}? This will also delete all their loan history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.runAsync("DELETE FROM loans WHERE borrower_id = ?", [id]);
            await db.runAsync("DELETE FROM users WHERE id = ?", [id]);
            loadBorrowers();
          },
        },
      ],
    );
  };

  const filteredBorrowers = borrowers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search),
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1 px-6 pt-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 flex-row items-center"
        >
          <ArrowLeft size={20} color="#64748b" />
          <Text className="ml-2 text-slate-500 font-medium">Back</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-foreground text-3xl font-bold">
            {editingId ? "Edit Borrower" : "New Borrower"}
          </Text>
          {editingId && (
            <TouchableOpacity
              onPress={cancelEdit}
              className="bg-slate-200 dark:bg-slate-800 p-2 rounded-full"
            >
              <X size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-slate-500 mb-8">
          {editingId
            ? `Updating details for ${name}`
            : "Register a client to start issuing loans."}
        </Text>

        {/* Form Fields */}
        <View className="gap-4">
          <View>
            <Text className="text-foreground font-medium mb-2 ml-1">
              Full Name
            </Text>
            <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3">
              <User size={20} color={editingId ? "#3b82f6" : "#94a3b8"} />
              <TextInput
                className="flex-1 ml-3 text-foreground"
                placeholder="e.g. Joshua Obed"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2 ml-1">
              M-Pesa Number
            </Text>
            <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3">
              <Phone size={20} color={editingId ? "#3b82f6" : "#94a3b8"} />
              <TextInput
                className="flex-1 ml-3 text-foreground"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2 ml-1">
              ID Number
            </Text>
            <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3">
              <CreditCard size={20} color={editingId ? "#3b82f6" : "#94a3b8"} />
              <TextInput
                className="flex-1 ml-3 text-foreground"
                keyboardType="numeric"
                value={idNumber}
                onChangeText={setIdNumber}
              />
            </View>
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2 ml-1">
              Total Loan Limit (Ksh)
            </Text>
            <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3">
              <ShieldCheck size={20} color="#2563eb" />
              <TextInput
                className="flex-1 ml-3 text-foreground font-bold"
                keyboardType="numeric"
                value={loanLimit}
                onChangeText={setLoanLimit}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSaveOrUpdate}
            disabled={loading}
            className={`mt-4 bg-primary p-4 rounded-2xl flex-row items-center justify-center ${loading ? "opacity-50" : ""}`}
          >
            <Text className="text-white font-bold text-lg mr-2">
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Details"
                  : "Register Borrower"}
            </Text>
            {!loading && <ChevronRight size={20} color="white" />}
          </TouchableOpacity>
        </View>

        {/* Directory Section */}
        <View className="mt-12 pb-20">
          <Text className="text-foreground text-2xl font-bold mb-4">
            Borrowers Directory
          </Text>
          <View className="flex-row items-center bg-card border border-border px-4 py-3 rounded-2xl mb-6">
            <Search size={20} color="#94a3b8" />
            <TextInput
              placeholder="Search directory..."
              className="flex-1 ml-3 text-foreground"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {filteredBorrowers.map((person) => (
            <View
              key={person.id}
              className="bg-card border border-border p-4 rounded-3xl mb-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg">
                  {person.name}
                </Text>
                <Text className="text-slate-500 text-sm">{person.phone}</Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => startEdit(person)}
                  className="bg-blue-100 p-3 rounded-xl"
                >
                  <Edit3 size={18} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteBorrower(person.id, person.name)}
                  className="bg-red-100 p-3 rounded-xl"
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
