import { useRouter } from "expo-router";
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
import React, { useState } from "react";
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
// Import your initial mock data
import { MOCK_BORROWERS } from "../db/mockData";

export default function AddBorrower() {
  const router = useRouter();
  const { isDark } = useTheme();

  // --- Form State ---
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [loanLimit, setLoanLimit] = useState("5000"); // Default from mock settings
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- Mock Directory State ---
  const [borrowers, setBorrowers] = useState(MOCK_BORROWERS);
  const [search, setSearch] = useState("");

  const handleSaveOrUpdate = () => {
    if (!name || !phone || !idNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    // Simulate Network/DB delay
    setTimeout(() => {
      if (editingId) {
        // Mock Update
        setBorrowers((prev) =>
          prev.map((b) =>
            b.id === editingId
              ? {
                  ...b,
                  name,
                  phone,
                  id_number: idNumber,
                  loan_limit: parseFloat(loanLimit),
                }
              : b,
          ),
        );
        Alert.alert("Success", "Borrower details updated!");
      } else {
        // Mock Insert
        const newBorrower = {
          id: Math.floor(Math.random() * 10000),
          name,
          phone,
          id_number: idNumber,
          loan_limit: parseFloat(loanLimit),
          status: "Approved",
          totalBorrowed: 0,
        };
        setBorrowers([newBorrower, ...borrowers]);
        Alert.alert("Success", `${name} has been added!`);
      }

      setLoading(false);
      cancelEdit();
    }, 600);
  };

  const startEdit = (person: any) => {
    setEditingId(person.id);
    setName(person.name);
    setPhone(person.phone);
    setIdNumber(person.id_number || "");
    setLoanLimit(person.loan_limit?.toString() || "5000");
    // Scroll to top to see the form
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setIdNumber("");
    setLoanLimit("5000");
    Keyboard.dismiss();
  };

  const deleteBorrower = (id: number, borrowerName: string) => {
    Alert.alert(
      "Delete Borrower",
      `Are you sure you want to delete ${borrowerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setBorrowers(borrowers.filter((b) => b.id !== id));
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

  const inputContainer =
    "flex-row items-center bg-card border border-border rounded-2xl px-4 py-4 shadow-sm";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1 px-6 pt-14"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 flex-row items-center"
        >
          <ArrowLeft size={20} color={isDark ? "#94a3b8" : "#64748b"} />
          <Text className="ml-2 text-slate-500 font-medium">Back to Home</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-foreground text-3xl font-black tracking-tight">
            {editingId ? "Edit Borrower" : "New Borrower"}
          </Text>
          {editingId && (
            <TouchableOpacity
              onPress={cancelEdit}
              className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full"
            >
              <X size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-slate-500 mb-8 font-medium">
          {editingId
            ? `Updating records for ${name}`
            : "Create a new client profile."}
        </Text>

        {/* Form Fields */}
        <View className="gap-y-5">
          <View>
            <Text className="text-foreground font-bold mb-2 ml-1 text-xs uppercase tracking-widest text-slate-400">
              Full Name
            </Text>
            <View className={inputContainer}>
              <User size={20} color={editingId ? "#3b82f6" : "#94a3b8"} />
              <TextInput
                className="flex-1 ml-3 text-foreground font-semibold"
                placeholder="e.g. Joshua Obed"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View className="flex-row gap-x-4">
            <View className="flex-1">
              <Text className="text-foreground font-bold mb-2 ml-1 text-xs uppercase tracking-widest text-slate-400">
                M-Pesa Number
              </Text>
              <View className={inputContainer}>
                <Phone size={18} color="#2563eb" />
                <TextInput
                  className="flex-1 ml-2 text-foreground font-semibold"
                  placeholder="07..."
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-bold mb-2 ml-1 text-xs uppercase tracking-widest text-slate-400">
                ID Number
              </Text>
              <View className={inputContainer}>
                <CreditCard size={18} color="#64748b" />
                <TextInput
                  className="flex-1 ml-2 text-foreground font-semibold"
                  placeholder="ID No."
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={idNumber}
                  onChangeText={setIdNumber}
                />
              </View>
            </View>
          </View>

          <View>
            <Text className="text-foreground font-bold mb-2 ml-1 text-xs uppercase tracking-widest text-slate-400">
              Total Credit Limit (Ksh)
            </Text>
            <View className={inputContainer}>
              <ShieldCheck size={20} color="#16a34a" />
              <TextInput
                className="flex-1 ml-3 text-foreground font-black text-lg"
                keyboardType="numeric"
                value={loanLimit}
                onChangeText={setLoanLimit}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSaveOrUpdate}
            disabled={loading}
            className={`mt-4 bg-primary p-5 rounded-3xl flex-row items-center justify-center shadow-xl shadow-blue-500/30 ${loading ? "opacity-50" : ""}`}
          >
            <Text className="text-white font-bold text-lg mr-2">
              {loading
                ? "Processing..."
                : editingId
                  ? "Update Profile"
                  : "Register Borrower"}
            </Text>
            {!loading && <ChevronRight size={20} color="white" />}
          </TouchableOpacity>
        </View>

        {/* Directory Section */}
        <View className="mt-14 pb-24">
          <View className="flex-row justify-between items-end mb-6">
            <View>
              <Text className="text-foreground text-2xl font-black">
                Directory
              </Text>
              <Text className="text-slate-500 text-xs font-medium uppercase tracking-tighter">
                Manage active clients
              </Text>
            </View>
            <Text className="text-primary font-bold">
              {filteredBorrowers.length} Total
            </Text>
          </View>

          <View className="flex-row items-center bg-card border border-border px-4 py-2 rounded-2xl mb-6 shadow-sm">
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search name or phone..."
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-3 h-10 text-foreground font-medium"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {filteredBorrowers.map((person) => (
            <View
              key={person.id}
              className="bg-card border border-border p-4 rounded-3xl mb-4 flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg">
                  {person.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md flex-row items-center">
                    <Phone size={10} color="#2563eb" />
                    <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-bold ml-1">
                      {person.phone}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => startEdit(person)}
                  className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl"
                >
                  <Edit3 size={18} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteBorrower(person.id, person.name)}
                  className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl"
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
