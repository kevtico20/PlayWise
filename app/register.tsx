import {
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
import RegisterForm from "../components/register/RegisterForm";

export default function RegisterScreen() {
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

            <View className="px-8 pt-4">
              <LoginTitle />
            </View>

            <RegisterForm />

            <View className="absolute bottom-0 left-0 right-0 pointer-events-none">
              <DecorativeTriangles />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GradientBackground>
  );
}
