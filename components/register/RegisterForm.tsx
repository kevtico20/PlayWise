import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTranslation } from "../../hooks/use-translation";
import authService from "../../services/authService";
import AnimatedHintInput from "../common/AnimatedHintInput";
import AnimatedHintPasswordInput from "../common/AnimatedHintPasswordInput";
import NumberInput from "../common/NumberInput";
import LoginButton from "../login/LoginButton";
import GenderSelector from "./GenderSelector";

interface FormErrors {
  email: string;
  nickname: string;
  age: string;
  gender: string;
  password: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    nickname: "",
    age: "",
    gender: "",
    password: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: "",
      nickname: "",
      age: "",
      gender: "",
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

    if (!gender) {
      newErrors.gender = t("auth.fillAllFields");
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
        gender: gender || undefined,
      });

      Alert.alert(
        t("common.success"),
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
    <View className="px-8 pt-8">
      <View className="mb-6">
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

        <GenderSelector
          label={t("auth.gender")}
          value={gender}
          onSelect={(value) => {
            setGender(value);
            setErrors({ ...errors, gender: "" });
          }}
          error={errors.gender}
          disabled={loading}
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
        activeOpacity={0.7}
        onPress={() => router.back()}
        disabled={loading}
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
  );
}
