import {
    ActivityIndicator,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTranslation } from "../../hooks/use-translation";
import LoginButton from "../login/LoginButton";
import OTPInput from "./OTPInput";

interface OTPFormProps {
  otpCode: string;
  rememberDevice: boolean;
  loading: boolean;
  error: string;
  onOTPChange: (code: string) => void;
  onRememberDeviceChange: (value: boolean) => void;
  onVerify: () => void;
  onResend: () => void;
  canResend: boolean;
}

export default function OTPForm({
  otpCode,
  rememberDevice,
  loading,
  error,
  onOTPChange,
  onRememberDeviceChange,
  onVerify,
  onResend,
  canResend,
}: OTPFormProps) {
  const { t } = useTranslation();

  return (
    <View className="px-8 pt-8">
      <View className="mb-6">
        <Text className="text-white text-lg font-bold text-center mb-2">
          {t("auth.enterOTPCode")}
        </Text>
        <Text className="text-white/70 text-sm text-center mb-6">
          {t("auth.otpCodeSent")}
        </Text>

        <OTPInput
          value={otpCode}
          onChange={onOTPChange}
          error={error}
          disabled={loading}
        />

        <View className="bg-white/10 rounded-xl p-4 mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-white font-semibold mb-1">
                {t("auth.rememberDevice")}
              </Text>
              <Text className="text-white/60 text-xs">
                {t("auth.rememberDeviceDesc")}
              </Text>
            </View>
            <Switch
              value={rememberDevice}
              onValueChange={onRememberDeviceChange}
              disabled={loading}
              trackColor={{ false: "#ffffff20", true: "#ffffff40" }}
              thumbColor={rememberDevice ? "#ffffff" : "#ffffff80"}
            />
          </View>
        </View>

        {loading && (
          <View className="mb-4">
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}

        <TouchableOpacity
          className="self-center mb-6"
          onPress={onResend}
          disabled={!canResend || loading}
          activeOpacity={0.7}
        >
          <Text
            className={`text-white text-sm font-semibold ${
              !canResend || loading ? "opacity-50" : ""
            }`}
          >
            {t("auth.resendCode")}
          </Text>
        </TouchableOpacity>

        <LoginButton
          onPress={onVerify}
          title={loading ? t("common.loading") : t("auth.verify")}
          disabled={loading || otpCode.length < 6}
        />
      </View>
    </View>
  );
}
