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
import authService, { extractUserFromToken } from "../services/authService";
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
      console.log("Login response:", JSON.stringify(response, null, 2));

      // Si requiere OTP, guardar datos temporales y navegar a la pantalla de verificación
      if (response.otp_required) {
        // Guardar email temporalmente para usarlo después en OTP
        await storageService.saveUserData({
          email: email.trim(),
          username: email.trim().split("@")[0],
        });
        router.push("/otp-verification");
        return;
      }

      // Si no requiere OTP, guardar tokens y datos del usuario, luego continuar
      if (response.access_token && response.refresh_token) {
        await storageService.saveTokens(
          response.access_token,
          response.refresh_token
        );
        
        // Guardar datos del usuario si están disponibles en la respuesta
        if (response.user) {
          console.log("Saving user from response:", response.user);
          await storageService.saveUserData(response.user);
        } else {
          // Si no vienen en la respuesta, obtenerlos del endpoint /users/me
          try {
            console.log("Fetching user data from /users/me");
            const userData = await authService.getCurrentUser(response.access_token);
            console.log("User data from /users/me:", userData);
            await storageService.saveUserData(userData);
          } catch (error) {
            console.warn("Could not fetch user data:", error);
            // Fallback 1: intentar extraer datos desde el token
            const extracted = extractUserFromToken(response.access_token);
            if (extracted) {
              console.log("Using user data extracted from token:", extracted);
              await storageService.saveUserData({
                email: extracted.email || email.trim(),
                username:
                  extracted.username || (email.trim().split("@")[0] || ""),
              });
            } else {
              // Fallback 2: guardar usuario mínimo con el email
              await storageService.saveUserData({
                email: email.trim(),
                username: email.trim().split("@")[0],
              });
            }
          }
        }
        
        // Navegar al tab 'main' (los grupos '(tabs)' no forman parte de la ruta)
        router.replace("/main");
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
