import { Text, View } from "react-native";
import { useTranslation } from "../../hooks/use-translation";

export default function LoginTitle() {
  const { t } = useTranslation();
  const text = t("auth.readyToPlay");

  return (
    <View className="mb-0 mt-1">
      <Text className="text-3xl font-bold text-center mb-2">
        <Text style={{ color: "#DB0000" }}>{text.split(" ")[0]} </Text>
        <Text className="text-white">{text.split(" ").slice(1).join(" ")}</Text>
      </Text>
      <View
        className="w-24 h-1 self-center"
        style={{ backgroundColor: "#DB0000" }}
      />
    </View>
  );
}
