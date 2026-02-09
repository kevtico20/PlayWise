import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_COLORS } from "../constants/colors";
import { useCurrentUser } from "../hooks/use-current-user";
import { useTranslation } from "../hooks/use-translation";
import friendsService from "../services/friendsService";
import storageService from "../services/storageService";

export default function SettingsScreen() {
  const router = useRouter();
  const { t, changeLanguage, locale, isChanging } = useTranslation();
  const { user, loading: userLoading } = useCurrentUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Cargar datos del usuario cuando esté disponible
  React.useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      loadFriendsCount();
    }
  }, [user]);

  const loadFriendsCount = async () => {
    try {
      setLoadingStats(true);
      const friends = await friendsService.getFriends();
      setFriendsCount(friends.length);
    } catch (error) {
      console.warn("Error loading friends count:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Aquí implementarías la lógica para actualizar el usuario en el backend
      Alert.alert(t("common.success"), t("settings.profileUpdated"));
      setIsEditing(false);
    } catch (error) {
      Alert.alert(t("common.error"), t("settings.profileUpdateError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(t("settings.deleteAccount"), t("settings.deleteConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("settings.deleteAccount"),
        style: "destructive",
        onPress: async () => {
          try {
            // Aquí implementarías la lógica para eliminar la cuenta
            await storageService.clearStorage();
            router.replace("/login");
          } catch (error) {
            Alert.alert(t("common.error"), t("settings.deleteAccountError"));
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    Alert.alert(t("settings.logout"), t("settings.logoutConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("settings.logout"),
        onPress: async () => {
          try {
            await storageService.clearStorage();
            router.replace("/login");
          } catch (error) {
            Alert.alert(t("common.error"), t("settings.logoutError"));
          }
        },
      },
    ]);
  };

  const handleLanguageChange = async (newLocale: "en" | "es") => {
    // Prevenir cambios si ya hay uno en proceso
    if (isChanging) {
      return;
    }

    await changeLanguage(newLocale);

    // Mostrar alerta después de que el cambio esté completo
    setTimeout(() => {
      Alert.alert(t("common.success"), t("settings.languageChanged"));
    }, 150);
  };

  if (userLoading) {
    return (
      <LinearGradient
        colors={[APP_COLORS.gradientTop, APP_COLORS.gradientBottom]}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[APP_COLORS.gradientTop, APP_COLORS.gradientBottom]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-white text-[20px] font-semibold">
            {t("settings.title")}
          </Text>

          <View className="w-[28]" />
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 pt-6">
          {/* Avatar/Initial */}
          <View className="items-center mb-6">
            <View className="w-[80] h-[80] rounded-full bg-[#4A4A4A] items-center justify-center mb-2">
              <Text className="text-white text-[32px] font-semibold">
                {username
                  ? username.charAt(0).toUpperCase()
                  : email.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Información de la cuenta */}
          <View className="mb-6">
            <Text className="text-white text-[18px] font-semibold mb-4">
              {t("settings.accountInfo")}
            </Text>

            {/* Username */}
            <View className="mb-4">
              <Text className="text-white/70 text-[14px] mb-2">
                {t("settings.username")}
              </Text>
              <View className="bg-white/10 rounded-[8px] px-4 py-3 flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#FFFFFF" />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  editable={isEditing}
                  className="flex-1 text-white text-[16px] ml-3"
                  placeholderTextColor="#FFFFFF50"
                  placeholder={t("settings.username")}
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-white/70 text-[14px] mb-2">
                {t("settings.email")}
              </Text>
              <View className="bg-white/10 rounded-[8px] px-4 py-3 flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  editable={false}
                  className="flex-1 text-white text-[16px] ml-3"
                  placeholderTextColor="#FFFFFF50"
                  placeholder={t("settings.emailPlaceholder")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <Text className="text-white/40 text-[12px] mt-1">
                {t("settings.emailCantChange")}
              </Text>
            </View>

            {/* Botones de editar/guardar */}
            {!isEditing ? (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="bg-blue-600 rounded-[8px] py-3 items-center"
              >
                <Text className="text-white text-[16px] font-semibold">
                  {t("settings.editProfile")}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(false);
                    setUsername(user?.username || "");
                    setEmail(user?.email || "");
                  }}
                  className="flex-1 bg-white/10 rounded-[8px] py-3 items-center"
                >
                  <Text className="text-white text-[16px] font-semibold">
                    {t("settings.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-600 rounded-[8px] py-3 items-center"
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-[16px] font-semibold">
                      {t("common.save")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Preferencias */}
          <View className="mb-6">
            <Text className="text-white text-[18px] font-semibold mb-4">
              {t("settings.preferences")}
            </Text>

            {/* Selector de Idioma */}
            <View className="mb-2">
              <Text className="text-white/70 text-[14px] mb-2">
                {t("settings.language")}
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleLanguageChange("es")}
                  disabled={isChanging || locale === "es"}
                  className={`flex-1 rounded-[8px] py-3 px-4 flex-row items-center justify-center ${
                    locale === "es" ? "bg-blue-600" : "bg-white/10"
                  } ${isChanging ? "opacity-50" : ""}`}
                >
                  {isChanging && locale !== "es" ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text className="text-white text-[16px] mr-2">🇪🇸</Text>
                      <Text className="text-white text-[16px] font-semibold">
                        {t("settings.spanish")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleLanguageChange("en")}
                  disabled={isChanging || locale === "en"}
                  className={`flex-1 rounded-[8px] py-3 px-4 flex-row items-center justify-center ${
                    locale === "en" ? "bg-blue-600" : "bg-white/10"
                  } ${isChanging ? "opacity-50" : ""}`}
                >
                  {isChanging && locale !== "en" ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text className="text-white text-[16px] mr-2">🇺🇸</Text>
                      <Text className="text-white text-[16px] font-semibold">
                        {t("settings.english")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Estadísticas */}
          <View className="mb-6">
            <Text className="text-white text-[18px] font-semibold mb-4">
              {t("settings.statistics")}
            </Text>
            <View className="bg-white/10 rounded-[8px] px-4 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={20} color="#FFFFFF" />
                <Text className="text-white text-[16px] ml-3">
                  {t("settings.friends")}
                </Text>
              </View>
              {loadingStats ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-[16px] font-semibold">
                  {friendsCount}
                </Text>
              )}
            </View>
          </View>

          {/* Zona de peligro */}
          <View className="mb-8">
            <Text className="text-white text-[18px] font-semibold mb-4">
              {t("settings.dangerZone")}
            </Text>

            <TouchableOpacity
              onPress={handleLogout}
              className="bg-orange-600 rounded-[8px] py-3 flex-row items-center justify-center mb-3"
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text className="text-white text-[16px] font-semibold ml-2">
                {t("settings.logout")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="bg-red-600 rounded-[8px] py-3 flex-row items-center justify-center"
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text className="text-white text-[16px] font-semibold ml-2">
                {t("settings.deleteAccount")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
