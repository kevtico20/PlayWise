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
import NumberInput from "../components/common/NumberInput";
import DecorativeTriangles from "../components/login/DecorativeTriangles";
import LoginButton from "../components/login/LoginButton";
import LoginHeader from "../components/login/LoginHeader";
import LoginTitle from "../components/login/LoginTitle";
import { useTranslation } from "../hooks/use-translation";
import authService from "../services/authService";

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    nickname: "",
    age: "",
    password: "",
  });

  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      nickname: "",
      age: "",
      password: "",
    };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = t("auth.fillAllFields");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("auth.invalidEmail");
      isValid = false;
    }

    if (!nickname.trim()) {
      newErrors.nickname = t("auth.fillAllFields");
      isValid = false;
    } else if (nickname.trim().length < 3) {
      newErrors.nickname = t("auth.usernameTooShort");
      isValid = false;
    }

    if (age === null || age < 13) {
      newErrors.age = t("auth.fillAllFields");
      isValid = false;
    }

    if (!password) {
      newErrors.password = t("auth.fillAllFields");
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = t("auth.passwordTooShort");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await authService.register({
        username: nickname.trim(),
        email: email.trim(),
        password,
        age: age?.toString(),
      });

      Alert.alert(
        "¡Éxito!",
        response.message || t("auth.registerSuccess"),
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      let errorMessage = t("auth.registerError");

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

  return (
    <GradientBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LoginHeader />

            <View className="px-8 pt-8">
              <LoginTitle />

              <View className="mb-6 mt-4">
                {/* Email */}
                <AnimatedHintInput
                  label={t("auth.email")}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: "" });
                  }}
                  keyboardType="email-address"
                  editable={!loading}
                  error={errors.email}
                />

                {/* Nickname */}
                <AnimatedHintInput
                  label={t("auth.nickname")}
                  value={nickname}
                  onChangeText={(text) => {
                    setNickname(text);
                    setErrors({ ...errors, nickname: "" });
                  }}
                  editable={!loading}
                  error={errors.nickname}
                />

                {/* Edad */}
                <NumberInput
                  label={t("auth.age")}
                  value={age}
                  onValueChange={(value) => {
                    setAge(value);
                    setErrors({ ...errors, age: "" });
                  }}
                  min={13}
                  max={100}
                  step={1}
                  placeholder={t("auth.selectAge")}
                  error={errors.age}
                />

                {/* Password */}
                <AnimatedHintInput
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
                activeOpacity={0.7}
                onPress={() => router.back()}
              >
                <View className="flex-row items-center py-2">
                  <View className="w-12 h-0.5 bg-white opacity-60 mr-3" />
                  <Text className="text-white text-base font-bold tracking-wide">
                    {t("auth.backToLogin")}
                  </Text>
                  <View className="w-12 h-0.5 bg-white opacity-60 ml-3" />
                </View>
              </TouchableOpacity>

              <LoginButton
                onPress={handleRegister}
                title={loading ? t("common.loading") : t("auth.registerButton")}
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
