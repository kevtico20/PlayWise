import { useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
}: OTPInputProps) {
  const inputs = useRef<TextInput[]>([]);
  const [focused, setFocused] = useState<number>(-1);

  const handleChange = (text: string, index: number) => {
    // Solo permitir números
    const numericText = text.replace(/[^0-9]/g, "");
    
    if (numericText.length === 0) {
      // Borrar dígito
      const newOtp = value.split("");
      newOtp[index] = "";
      onChange(newOtp.join(""));
      
      // Mover al input anterior
      if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
      return;
    }

    // Si se pega un código completo
    if (numericText.length === length) {
      onChange(numericText);
      inputs.current[length - 1]?.blur();
      return;
    }

    // Agregar dígito
    const newOtp = value.split("");
    newOtp[index] = numericText[0];
    onChange(newOtp.join(""));

    // Mover al siguiente input
    if (index < length - 1 && numericText.length > 0) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-center gap-3">
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputs.current[index] = ref;
            }}
            value={value[index] || ""}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(-1)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!disabled}
            selectTextOnFocus
            className={`w-12 h-14 rounded-xl border-2 text-center text-2xl font-bold text-white ${
              focused === index
                ? "bg-white/20 border-white"
                : error
                ? "bg-red-500/10 border-red-400"
                : "bg-white/5 border-white/20"
            } ${disabled ? "opacity-50" : ""}`}
          />
        ))}
      </View>
      {error ? (
        <Text className="text-red-400 text-xs mt-2 text-center">{error}</Text>
      ) : null}
    </View>
  );
}
