import { Link, useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Eye, Phone, Search, Trash2, UserX } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface Borrower {
  id: number;
  name: string;
  phone: string;
  id_number: string;
}

export default function BorrowersList() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { isDark } = useTheme();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [search, setSearch] = useState("");

  const loadBorrowers = useCallback(async () => {
    try {
      const data = await db.getAllAsync<Borrower>(
        "SELECT id, name, phone, id_number FROM users ORDER BY name ASC",
      );
      setBorrowers(data);
    } catch (error) {
      console.error("Load Borrowers Error:", error);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadBorrowers();
    }, [loadBorrowers]),
  );

  const deleteBorrower = (id: number, name: string) => {
    Alert.alert(
      "Delete Borrower",
      `Are you sure you want to delete ${name}? This will also delete all their loan history.`,
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
    <View className="flex-1 bg-background px-6 pt-14">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <Text className="text-foreground text-3xl font-black">Directory</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-card border border-border px-4 py-4 rounded-[24px] mb-6 shadow-sm">
        <Search size={20} color={isDark ? "#64748b" : "#94a3b8"} />
        <TextInput
          placeholder="Search by name or phone..."
          placeholderTextColor="#94a3b8"
          className="flex-1 ml-3 text-foreground font-medium"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
        {filteredBorrowers.length === 0 ? (
          <View className="items-center mt-20 opacity-50">
            <UserX size={48} color="#94a3b8" />
            <Text className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-[10px]">
              No matches found
            </Text>
          </View>
        ) : (
          filteredBorrowers.map((person) => (
            <View
              key={person.id}
              className="bg-card border border-border p-5 rounded-[32px] mb-4 flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-1">
                <Text className="text-foreground font-black text-lg">
                  {person.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Phone size={12} color="#64748b" />
                  <Text className="text-slate-500 text-xs font-bold ml-2">
                    {person.phone}
                  </Text>
                </View>
              </View>

              {/* Action Buttons Row - Whitespace minimized to prevent Text Error */}
              <View className="flex-row gap-2">
                <Link href={`/borrower/${person.id}`} asChild>
                  <TouchableOpacity className="bg-blue-500/10 p-3 rounded-2xl">
                    <Eye size={18} color="#2563eb" />
                  </TouchableOpacity>
                </Link>
                <TouchableOpacity
                  onPress={() => deleteBorrower(person.id, person.name)}
                  className="bg-red-500/10 p-3 rounded-2xl"
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
