import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "../../hooks/use-translation";
import storageService from "../../services/storageService";

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(t("common.confirm"), t("auth.logoutConfirm"), [
      {
        text: t("common.cancel"),
        onPress: () => {},
        style: "cancel",
      },
      {
        text: t("auth.logout"),
        onPress: async () => {
          try {
            await storageService.clear();
            onClose();
            router.replace("/login");
          } catch (error) {
            Alert.alert(t("common.error"), t("auth.logoutError"));
          }
        },
        style: "destructive",
      },
    ]);
  };

  const menuItems = [
    {
      id: "wishlist",
      label: t("menu.wishlist"),
      icon: "heart-outline" as const,
      onPress: () => {
        onClose();
        router.push("/wishlist");
      },
    },
    {
      id: "friends",
      label: t("menu.friends"),
      icon: "people-outline" as const,
      onPress: () => {
        onClose();
        router.push("/friends");
      },
    },
    {
      id: "settings",
      label: t("menu.accountSettings"),
      icon: "settings-outline" as const,
      onPress: () => {
        onClose();
        router.push("/settings");
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />

        <View className="bg-[#1A1A1A] rounded-t-[20] py-4 px-4 pb-8">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              className="flex-row items-center py-[14] px-3 rounded-[12] mb-2 gap-3"
              activeOpacity={0.85}
            >
              <Ionicons name={item.icon} size={20} color="#FFFFFF" />
              <Text className="text-white text-[16px] font-medium flex-1">
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF80" />
            </TouchableOpacity>
          ))}

          <View className="h-[1] bg-white/20 my-3" />

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center py-[14] px-3 rounded-[12] gap-3 bg-[#FF4444]/10"
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text className="text-[#FF4444] text-[16px] font-medium flex-1">
              {t("auth.logout") || "Cerrar sesión"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FF444480" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
