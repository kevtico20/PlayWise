import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import GradientBackground from "../components/GradientBackground";
import DecorativeTriangles from "../components/login/DecorativeTriangles";
import LoginForm from "../components/login/LoginForm";
import LoginHeader from "../components/login/LoginHeader";
import LoginTitle from "../components/login/LoginTitle";
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

      // Si requiere OTP, navegar a la pantalla de verificación
      if (response.otp_required) {
        router.push("/otp-verification");
        return;
      }

      // Si no requiere OTP, guardar tokens y continuar
      if (response.access_token && response.refresh_token) {
        await storageService.saveTokens(
          response.access_token,
          response.refresh_token
        );
        router.replace("/(tabs)/main");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setErrors({ ...errors, email: "" });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrors({ ...errors, password: "" });
  };

  const handleNavigateToRegister = () => {
    router.push("/register");
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

            <View className="px-8 pt-4">
              <LoginTitle />
            </View>

            <LoginForm
              email={email}
              password={password}
              loading={loading}
              errors={errors}
              onEmailChange={handleEmailChange}
              onPasswordChange={handlePasswordChange}
              onLogin={handleLogin}
              onNavigateToRegister={handleNavigateToRegister}
            />

            <View className="absolute bottom-0 left-0 right-0 pointer-events-none">
              <DecorativeTriangles />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GradientBackground>
  );
}
