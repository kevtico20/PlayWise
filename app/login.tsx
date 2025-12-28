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
import DecorativeTriangles from "../components/login/DecorativeTriangles";
import LoginButton from "../components/login/LoginButton";
import LoginHeader from "../components/login/LoginHeader";
import LoginTitle from "../components/login/LoginTitle";

import AnimatedHintInput from "../components/common/AnimatedHintInput";
import AnimatedHintPasswordInput from "../components/common/AnimatedHintPasswordInput";

import { useTranslation } from "../hooks/use-translation";
import authService from "../services/authService";
import storageService from "../services/storageService";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = (): boolean => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = t("auth.fillAllFields");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("auth.invalidEmail");
      isValid = false;
    }

    if (!password) {
      newErrors.password = t("auth.fillAllFields");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await authService.login(email.trim(), password);

      await storageService.saveTokens(
        response.access_token,
        response.refresh_token
      );

      Alert.alert("Éxito", t("auth.loginSuccess"));
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message || t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <LoginHeader />

            <View className="px-8 pt-8">
              <LoginTitle />

              <View className="mt-6 mb-4">
                <AnimatedHintInput
                  label={t("auth.userOrEmail")}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: "" });
                  }}
                  keyboardType="email-address"
                  editable={!loading}
                  error={errors.email}
                />

                <AnimatedHintPasswordInput
                  label={t("auth.password")}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: "" });
                  }}
                  editable={!loading}
                  error={errors.password}
                />
              </View>

              {loading && (
                <View className="mb-4">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              )}

              <TouchableOpacity
                className="self-center mb-8"
                onPress={() => router.push("/register")}
              >
                <View className="flex-row items-center py-2">
                  <View className="w-12 h-0.5 bg-white/60 mr-3" />
                  <Text className="text-white font-bold">
                    {t("auth.createAccount")}
                  </Text>
                  <View className="w-12 h-0.5 bg-white/60 ml-3" />
                </View>
              </TouchableOpacity>

              <LoginButton
                onPress={handleLogin}
                title={loading ? t("common.loading") : t("auth.letsPlay")}
                disabled={loading}
              />
            </View>

            <View className="absolute bottom-0 left-0 right-0 pointer-events-none">
              <DecorativeTriangles />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GradientBackground>
  );
}
