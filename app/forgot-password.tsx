import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import AnimatedHintInput from "../components/common/AnimatedHintInput";
import { useTranslation } from "../hooks/use-translation";
import authService from "../services/authService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError(t("auth.fillAllFields"));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("auth.invalidEmail"));
      return false;
    }
    setError("");
    return true;
  };

  const handleRequestReset = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      await authService.requestPasswordReset(email.trim());
      setEmailSent(true);
    } catch (err: any) {
      const message = err.message || t("auth.networkError");
      Alert.alert(t("common.error"), message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (emailSent) {
    return (
      <GradientBackground>
        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-white/10 rounded-full p-6 mb-6">
            <Ionicons name="mail-outline" size={64} color="#fff" />
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-4">
            {t("auth.resetEmailSent")}
          </Text>
          <Text className="text-white/80 text-center mb-8 px-4">
            {t("auth.resetEmailSentDesc")}
          </Text>
          <TouchableOpacity
            className="bg-white/20 px-8 py-4 rounded-full"
            onPress={handleGoBack}
          >
            <Text className="text-white font-bold text-lg">
              {t("auth.backToLogin")}
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
              {/* Header con botón de volver */}
              <TouchableOpacity
                className="absolute top-12 left-4 p-2"
                onPress={handleGoBack}
              >
                <Ionicons name="arrow-back" size={28} color="#fff" />
              </TouchableOpacity>

              {/* Icono */}
              <View className="items-center mb-8">
                <View className="bg-white/10 rounded-full p-6 mb-4">
                  <Ionicons name="key-outline" size={64} color="#fff" />
                </View>
                <Text className="text-white text-3xl font-bold text-center">
                  {t("auth.forgotPassword")}
                </Text>
                <Text className="text-white/70 text-center mt-2 px-4">
                  {t("auth.forgotPasswordDesc")}
                </Text>
              </View>

              {/* Formulario */}
              <View className="mb-6">
                <AnimatedHintInput
                  label={t("auth.email")}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError("");
                  }}
                  keyboardType="email-address"
                  editable={!loading}
                  error={error}
                />
              </View>

              {loading && (
                <View className="mb-4">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              )}

              {/* Botón de enviar */}
              <TouchableOpacity
                className={`bg-white/20 py-4 rounded-full items-center ${loading ? "opacity-50" : ""}`}
                onPress={handleRequestReset}
                disabled={loading}
              >
                <Text className="text-white font-bold text-lg">
                  {loading ? t("common.loading") : t("auth.sendResetLink")}
                </Text>
              </TouchableOpacity>

              {/* Link para volver al login */}
              <TouchableOpacity
                className="mt-6 items-center"
                onPress={handleGoBack}
                disabled={loading}
              >
                <Text className="text-white/70">
                  {t("auth.rememberPassword")}{" "}
                  <Text className="text-white font-bold">
                    {t("auth.login")}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
