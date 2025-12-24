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

import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";
import DecorativeTriangles from "../components/login/DecorativeTriangles";
import LoginButton from "../components/login/LoginButton";
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

    // Validar email
    if (!email.trim()) {
      newErrors.email = t("auth.fillAllFields");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("auth.invalidEmail");
      isValid = false;
    }

    // Validar password
    if (!password) {
      newErrors.password = t("auth.fillAllFields");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // Intentar login
      const response = await authService.login(email.trim(), password);

      // Guardar tokens
      await storageService.saveTokens(
        response.access_token,
        response.refresh_token
      );

      // Mostrar mensaje de éxito
      Alert.alert("Éxito", t("auth.loginSuccess"));

      // Navegar a la app
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);

      // Manejar diferentes tipos de errores
      let errorMessage = t("auth.loginError");

      if (error.status === 0) {
        errorMessage = t("auth.networkError");
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
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
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LoginHeader />

            {/* Contenido del formulario */}
            <View className="px-8 pt-8">
              <LoginTitle />

              {/* Inputs de formulario */}
              <View className="mb-6 mt-4">
                <Input
                  label={t("auth.userOrEmail")}
                  placeholder={t("auth.userOrEmail")}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: "" });
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={errors.email}
                  editable={!loading}
                />

                <PasswordInput
                  label={t("auth.password")}
                  placeholder={t("auth.password")}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: "" });
                  }}
                  error={errors.password}
                  editable={!loading}
                />
              </View>

              {/* Indicador de carga */}
              {loading && (
                <View className="mb-4">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              )}

              {/* Enlace crear cuenta */}
              <TouchableOpacity
                className="self-center mb-8"
                activeOpacity={0.7}
                onPress={handleCreateAccount}
              >
                <View className="flex-row items-center py-2">
                  <View className="w-12 h-0.5 bg-white opacity-60 mr-3" />
                  <Text className="text-white text-base font-bold tracking-wide">
                    {t("auth.createAccount")}
                  </Text>
                  <View className="w-12 h-0.5 bg-white opacity-60 ml-3" />
                </View>
              </TouchableOpacity>

              {/* Botón de login */}
              <LoginButton
                onPress={handleLogin}
                title={loading ? t("common.loading") : t("auth.letsPlay")}
                disabled={loading}
              />
            </View>

            {/* Decoraciones */}
            <View className="mt-auto">
              <DecorativeTriangles />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GradientBackground>
  );
}
