import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { APP_COLORS } from "../constants/colors";
import { useTranslation } from "../hooks/use-translation";

// ✅ Enable className support for LinearGradient (expo-linear-gradient)
cssInterop(LinearGradient, {
  className: "style",
});

export default function FriendsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[APP_COLORS.gradientTop, APP_COLORS.gradientBottom]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-white font-semibold">{t("friends.title")}</Text>

          <View className="w-[28]" />
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-[16]">{t("friends.title")} - Coming Soon</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
