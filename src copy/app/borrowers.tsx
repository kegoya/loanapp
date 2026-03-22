import { Link, useRouter } from "expo-router";
import {
  ArrowLeft,
  Edit3,
  Eye,
  Phone,
  Search,
  Trash2,
  UserX,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MOCK_BORROWERS } from "../db/mockData";

export default function BorrowersList() {
  const router = useRouter();
  const { isDark } = useTheme();

  // 1. Use Mock Data state
  const [borrowers, setBorrowers] = useState(MOCK_BORROWERS);
  const [search, setSearch] = useState("");

  const deleteBorrower = (id: number, name: string) => {
    Alert.alert(
      "Delete Borrower",
      `Are you sure you want to delete ${name}? This will also delete all their loan history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Update local state instead of DB
            setBorrowers((prev) => prev.filter((b) => b.id !== id));
          },
        },
      ],
    );
  };

  // 2. Search logic works perfectly with JSON
  const filteredBorrowers = borrowers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search),
  );

  return (
    <View className="flex-1 bg-background px-6 pt-14">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={isDark ? "#f8fafc" : "#64748b"} />
        </TouchableOpacity>
        <Text className="text-foreground text-2xl font-bold ml-2">
          Borrowers Directory
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-card border border-border px-4 py-1 rounded-2xl mb-6 shadow-sm">
        <Search size={18} color="#94a3b8" />
        <TextInput
          placeholder="Search name or phone..."
          placeholderTextColor="#94a3b8"
          className="flex-1 ml-3 h-12 text-foreground font-medium"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
        {filteredBorrowers.length === 0 ? (
          <View className="items-center mt-20">
            <View className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
              <UserX size={40} color="#94a3b8" />
            </View>
            <Text className="text-slate-400 font-medium">
              No borrowers found
            </Text>
          </View>
        ) : (
          filteredBorrowers.map((person) => (
            <View
              key={person.id}
              className="bg-card border border-border p-4 rounded-3xl mb-4 flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg">
                  {person.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Phone size={14} color="#2563eb" />
                  <Text className="text-slate-500 text-sm ml-2 font-medium">
                    {person.phone}
                  </Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View className="flex-row gap-2">
                <Link href={`/borrower/${person.id}`} asChild>
                  <TouchableOpacity className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl">
                    <Eye size={18} color="#2563eb" />
                  </TouchableOpacity>
                </Link>

                <TouchableOpacity
                  className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl"
                  onPress={() =>
                    Alert.alert("Edit", "Edit screen coming soon!")
                  }
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
          ))
        )}
      </ScrollView>
    </View>
  );
}
