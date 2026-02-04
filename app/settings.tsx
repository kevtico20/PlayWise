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
import storageService from "../services/storageService";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: userLoading } = useCurrentUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar datos del usuario cuando esté disponible
  React.useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Aquí implementarías la lógica para actualizar el usuario en el backend
      Alert.alert(t("common.success"), "Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (error) {
      Alert.alert(t("common.error"), "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Aquí implementarías la lógica para eliminar la cuenta
              await storageService.clearStorage();
              router.replace("/login");
            } catch (error) {
              Alert.alert(t("common.error"), "No se pudo eliminar la cuenta");
            }
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar Sesión",
        onPress: async () => {
          try {
            await storageService.clearStorage();
            router.replace("/login");
          } catch (error) {
            Alert.alert(t("common.error"), "No se pudo cerrar sesión");
          }
        },
      },
    ]);
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
              Información de la Cuenta
            </Text>

            {/* Username */}
            <View className="mb-4">
              <Text className="text-white/70 text-[14px] mb-2">
                Nombre de Usuario
              </Text>
              <View className="bg-white/10 rounded-[8px] px-4 py-3 flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#FFFFFF" />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  editable={isEditing}
                  className="flex-1 text-white text-[16px] ml-3"
                  placeholderTextColor="#FFFFFF50"
                  placeholder="Nombre de usuario"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-white/70 text-[14px] mb-2">
                Correo Electrónico
              </Text>
              <View className="bg-white/10 rounded-[8px] px-4 py-3 flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  editable={false}
                  className="flex-1 text-white text-[16px] ml-3"
                  placeholderTextColor="#FFFFFF50"
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <Text className="text-white/40 text-[12px] mt-1">
                El correo no se puede modificar
              </Text>
            </View>

            {/* Botones de editar/guardar */}
            {!isEditing ? (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="bg-blue-600 rounded-[8px] py-3 items-center"
              >
                <Text className="text-white text-[16px] font-semibold">
                  Editar Perfil
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
                    Cancelar
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
                      Guardar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Estadísticas */}
          <View className="mb-6">
            <Text className="text-white text-[18px] font-semibold mb-4">
              Estadísticas
            </Text>
            <View className="bg-white/10 rounded-[8px] px-4 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={20} color="#FFFFFF" />
                <Text className="text-white text-[16px] ml-3">Amigos</Text>
              </View>
              <Text className="text-white text-[16px] font-semibold">0</Text>
            </View>
          </View>

          {/* Zona de peligro */}
          <View className="mb-8">
            <Text className="text-white text-[18px] font-semibold mb-4">
              Zona de Peligro
            </Text>

            <TouchableOpacity
              onPress={handleLogout}
              className="bg-orange-600 rounded-[8px] py-3 flex-row items-center justify-center mb-3"
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text className="text-white text-[16px] font-semibold ml-2">
                Cerrar Sesión
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="bg-red-600 rounded-[8px] py-3 flex-row items-center justify-center"
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text className="text-white text-[16px] font-semibold ml-2">
                Eliminar Cuenta
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
