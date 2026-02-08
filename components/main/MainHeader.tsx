import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useCurrentUser } from "../../hooks/use-current-user";
import ProfileMenu from "./ProfileMenu";

interface MainHeaderProps {
  onSearchPress?: () => void;
}

export default function MainHeader({ onSearchPress }: MainHeaderProps) {
  const { getUserInitial } = useCurrentUser();
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  return (
    <>
      <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center pl-[6] pr-[14] py-2 pt-[30] bg-transparent">
        <Image
          source={require("../../assets/images/logo.png")}
          resizeMode="contain"
          className="w-[100] h-[70]"
        />

        <View className="flex-row items-center gap-[10]">
          <TouchableOpacity
            onPress={() => {
              if (onSearchPress) return onSearchPress();
              // Navegar a la pantalla de búsqueda por defecto
              (router as any).push({ pathname: "/search" });
            }}
            className="w-[23] h-[23] justify-center items-center"
          >
            <Ionicons name="search" size={23} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="ml-[5]"
          >
            <View className="w-[25] h-[23] rounded-full bg-[#4A4A4A] justify-center items-center">
              <Text className="text-[#D9D9D9] text-[16px] font-semibold">
                {getUserInitial()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ProfileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}
