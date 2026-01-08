import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import LoginHeader from "../components/login/LoginHeader";
import LoginTitle from "../components/login/LoginTitle";
import OTPForm from "../components/otp/OTPForm";
import { useTranslation } from "../hooks/use-translation";
import authService from "../services/authService";
import storageService from "../services/storageService";

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [otpCode, setOtpCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  // Verificar que hay un login pendiente
  useEffect(() => {
    const pendingEmail = authService.getPendingLoginEmail();
    if (!pendingEmail) {
      Alert.alert(
        t("common.error"),
        t("auth.noPendingLogin"),
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    }
  }, [router, t]);

  // Timer para reenvío
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOTPChange = (code: string) => {
    setOtpCode(code);
    setError("");
  };

  const handleVerify = async () => {
    if (otpCode.length < 6) {
      setError(t("auth.otpCodeRequired"));
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await authService.verifyOTP(otpCode, rememberDevice);

      if (response.access_token && response.refresh_token) {
        await storageService.saveTokens(
          response.access_token,
          response.refresh_token
        );

        Alert.alert(
          t("common.success"),
          t("auth.loginSuccess"),
          [{ text: "OK", onPress: () => router.replace("/(tabs)/main") }]
        );
      }
    } catch (error: any) {
      setError(error.message || t("auth.invalidOTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60); // 60 segundos de espera

    try {
      await authService.resendOTP();
      Alert.alert(t("common.success"), t("auth.otpResent"));
      setOtpCode(""); // Limpiar código anterior
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("auth.resendError"));
      setCanResend(true);
      setResendTimer(0);
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

            <View className="px-8 pt-4">
              <LoginTitle />
            </View>

            <OTPForm
              otpCode={otpCode}
              rememberDevice={rememberDevice}
              loading={loading}
              error={error}
              onOTPChange={handleOTPChange}
              onRememberDeviceChange={setRememberDevice}
              onVerify={handleVerify}
              onResend={handleResend}
              canResend={canResend}
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
