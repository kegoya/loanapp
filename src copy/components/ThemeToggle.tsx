import { Monitor, Moon, Sun } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { themeMode, setTheme } = useTheme();

  const options: {
    id: "light" | "dark" | "system";
    icon: any;
    label: string;
  }[] = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "system", icon: Monitor, label: "System" },
    { id: "dark", icon: Moon, label: "Dark" },
  ];

  return (
    <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-center border border-border">
      {options.map((opt) => {
        const isActive = themeMode === opt.id;
        const Icon = opt.icon;

        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => {
              // Wrap in requestAnimationFrame for a smoother UI transition
              requestAnimationFrame(() => {
                setTheme(opt.id);
              });
            }}
            className={`flex-row items-center px-4 py-2 rounded-lg ${
              isActive ? "bg-white dark:bg-slate-700 shadow-sm" : ""
            }`}
          >
            <Icon size={16} color={isActive ? "#2563eb" : "#64748b"} />
            {isActive && (
              <Text className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                {opt.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
