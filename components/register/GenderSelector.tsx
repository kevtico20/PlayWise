import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "../../hooks/use-translation";

interface GenderSelectorProps {
  value: string | null;
  onSelect: (gender: string) => void;
  label: string;
  error?: string;
  disabled?: boolean;
}

const genderIcons = {
  male: "♂",
  female: "♀",
  other: "⚥",
  prefer_not_to_say: "–",
};

export default function GenderSelector({
  value,
  onSelect,
  label,
  error,
  disabled = false,
}: GenderSelectorProps) {
  const { t } = useTranslation();

  const genderOptions = [
    { value: "male", label: t("auth.genderMale"), icon: genderIcons.male },
    { value: "female", label: t("auth.genderFemale"), icon: genderIcons.female },
  ];

  return (
    <View className="mb-4">
      <Text className="text-white/90 text-sm font-semibold mb-2 ml-1">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => !disabled && onSelect(option.value)}
            disabled={disabled}
            className={`flex-1 min-w-[45%] px-4 py-3 rounded-xl border-2 ${
              value === option.value
                ? "bg-white/20 border-white"
                : "bg-white/5 border-white/20"
            } ${disabled ? "opacity-50" : ""}`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center font-semibold ${
                value === option.value ? "text-white" : "text-white/70"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? (
        <Text className="text-red-400 text-xs mt-1 ml-1">{error}</Text>
      ) : null}
    </View>
  );
}
