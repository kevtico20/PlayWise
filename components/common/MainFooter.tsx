import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { APP_COLORS } from "../../constants/colors";
import { useTranslation } from "../../hooks/use-translation";

export default function MainFooter() {
  const { t } = useTranslation();

  return (
    <View className="py-6 px-4 items-center justify-center bg-transparent">
      <Text
        className="text-[16px] font-bold mb-[6]"
        style={{ color: APP_COLORS.labelActive || "#FFFFFF" }}
      >
        PlayWise
      </Text>

      <Text className="text-[#cfcfcf] text-[12px] text-center mb-[10]">
        {t("footer.tagline")}
      </Text>

      <View className="flex-row justify-center items-center mb-[10] space-x-4">
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:playwiseapp2025@gmail.com")}
          accessibilityLabel="Enviar correo a soporte"
        >
          <Text className="text-white text-[12px] underline">
            {t("footer.support")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL("https://example.com/privacy")}
        >
          <Text className="text-white text-[12px] underline">
            {t("footer.privacy")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL("https://example.com/terms")}
        >
          <Text className="text-white text-[12px] underline">
            {t("footer.terms")}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-[#9b9b9b] text-[11px]">
        © {new Date().getFullYear()} PlayWise
      </Text>
    </View>
  );
}
