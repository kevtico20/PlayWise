import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import GradientBackground from "../components/GradientBackground";
import AnimatedHintPasswordInput from "../components/common/AnimatedHintPasswordInput";
import { useTranslation } from "../hooks/use-translation";
import authService from "../services/authService";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = (): boolean => {
    const newErrors = { newPassword: "", confirmPassword: "" };
    let isValid = true;

    if (!newPassword) {
      newErrors.newPassword = t("auth.fillAllFields");
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t("auth.passwordTooShort");
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("auth.fillAllFields");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("auth.passwordsDoNotMatch");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    if (!token) {
      Alert.alert(t("common.error"), t("auth.invalidResetToken"));
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      await authService.resetPassword(token, newPassword);
      setResetSuccess(true);
    } catch (err: any) {
      const message = err.message || t("auth.resetPasswordError");
      Alert.alert(t("common.error"), message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.replace("/login");
  };

  // Si no hay token, mostrar error
  if (!token) {
    return (
      <GradientBackground>
        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-red-500/20 rounded-full p-6 mb-6">
            <Ionicons name="alert-circle-outline" size={64} color="#fff" />
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-4">
            {t("auth.invalidResetLink")}
          </Text>
          <Text className="text-white/80 text-center mb-8 px-4">
            {t("auth.invalidResetLinkDesc")}
          </Text>
          <TouchableOpacity
            className="bg-white/20 px-8 py-4 rounded-full"
            onPress={handleGoToLogin}
          >
            <Text className="text-white font-bold text-lg">
              {t("auth.backToLogin")}
            </Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  // Si el reset fue exitoso
  if (resetSuccess) {
    return (
      <GradientBackground>
        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-green-500/20 rounded-full p-6 mb-6">
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color="#4ade80"
            />
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-4">
            {t("auth.passwordResetSuccess")}
          </Text>
          <Text className="text-white/80 text-center mb-8 px-4">
            {t("auth.passwordResetSuccessDesc")}
          </Text>
          <TouchableOpacity
            className="bg-white/20 px-8 py-4 rounded-full"
            onPress={handleGoToLogin}
          >
            <Text className="text-white font-bold text-lg">
              {t("auth.goToLogin")}
            </Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-center px-8">
              {/* Icono */}
              <View className="items-center mb-8">
                <View className="bg-white/10 rounded-full p-6 mb-4">
                  <Ionicons name="lock-closed-outline" size={64} color="#fff" />
                </View>
                <Text className="text-white text-3xl font-bold text-center">
                  {t("auth.resetPassword")}
                </Text>
                <Text className="text-white/70 text-center mt-2 px-4">
                  {t("auth.resetPasswordDesc")}
                </Text>
              </View>

              {/* Formulario */}
              <View className="mb-6">
                <AnimatedHintPasswordInput
                  label={t("auth.newPassword")}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword)
                      setErrors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  editable={!loading}
                  error={errors.newPassword}
                />

                <AnimatedHintPasswordInput
                  label={t("auth.confirmPassword")}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  editable={!loading}
                  error={errors.confirmPassword}
                />
              </View>

              {loading && (
                <View className="mb-4">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              )}

              {/* Botón de resetear */}
              <TouchableOpacity
                className={`bg-white/20 py-4 rounded-full items-center ${loading ? "opacity-50" : ""}`}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text className="text-white font-bold text-lg">
                  {loading
                    ? t("common.loading")
                    : t("auth.resetPasswordButton")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
