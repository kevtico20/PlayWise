import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "../../hooks/use-translation";
import AnimatedHintInput from "../common/AnimatedHintInput";
import AnimatedHintPasswordInput from "../common/AnimatedHintPasswordInput";
import LoginButton from "./LoginButton";

interface FormErrors {
  email: string;
  password: string;
}

interface LoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  errors: FormErrors;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export default function LoginForm({
  email,
  password,
  loading,
  errors,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: LoginFormProps) {
  const { t } = useTranslation();

  return (
    <View className="px-8 pt-8">
      <View className="mt-6 mb-4">
        <AnimatedHintInput
          label={t("auth.userOrEmail")}
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          editable={!loading}
          error={errors.email}
        />

        <AnimatedHintPasswordInput
          label={t("auth.password")}
          value={password}
          onChangeText={onPasswordChange}
          editable={!loading}
          error={errors.password}
        />

        {/* Link para recuperar contraseña */}
        <TouchableOpacity
          className="self-end mt-1"
          onPress={onNavigateToForgotPassword}
          disabled={loading}
        >
          <Text className="text-white/70 text-sm">
            {t("auth.forgotPassword")}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="mb-4">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      <TouchableOpacity
        className="self-center mb-8"
        onPress={onNavigateToRegister}
        disabled={loading}
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
        onPress={onLogin}
        title={loading ? t("common.loading") : t("auth.letsPlay")}
        disabled={loading}
      />
    </View>
  );
}
