import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface NumberInputProps {
  label?: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function NumberInput({
  label,
  value,
  onValueChange,
  error,
  containerClassName = "",
  labelClassName = "",
  errorClassName = "",
  placeholder = "0",
  min = 0,
  max = 999,
  step = 1,
}: NumberInputProps) {
  const handleIncrement = () => {
    const currentValue = value ?? min;
    if (currentValue + step <= max) {
      onValueChange(currentValue + step);
    }
  };

  const handleDecrement = () => {
    const currentValue = value ?? min;
    if (currentValue - step >= min) {
      onValueChange(currentValue - step);
    }
  };

  const handleTextChange = (text: string) => {
    // Permitir campo vacío
    if (text === "") {
      onValueChange(null);
      return;
    }

    // Filtrar solo números
    const numericText = text.replace(/[^0-9]/g, "");
    
    if (numericText === "") {
      onValueChange(null);
      return;
    }

    const numValue = parseInt(numericText, 10);

    // Validar rango
    if (!isNaN(numValue)) {
      if (numValue > max) {
        onValueChange(max);
      } else if (numValue < min) {
        onValueChange(min);
      } else {
        onValueChange(numValue);
      }
    }
  };

  const isAtMin = value !== null && value <= min;
  const isAtMax = value !== null && value >= max;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text
          className={`text-white text-sm font-semibold mb-2 ${labelClassName}`}
        >
          {label}
        </Text>
      )}
      <View
        className={`bg-white/10 rounded-2xl border-2 flex-row items-center ${
          error ? "border-red-400" : "border-white/20"
        }`}
      >
        {/* Botón decrementar */}
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={isAtMin}
          className={`px-4 py-3 ${isAtMin ? "opacity-40" : "opacity-100"}`}
          activeOpacity={0.7}
        >
          <Ionicons
            name="remove-circle-outline"
            size={24}
            color="rgba(255, 255, 255, 0.9)"
          />
        </TouchableOpacity>

        {/* Input numérico */}
        <TextInput
          className="flex-1 text-white text-base text-center font-semibold"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={value !== null ? value.toString() : ""}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          placeholder={placeholder}
          maxLength={max.toString().length}
        />

        {/* Botón incrementar */}
        <TouchableOpacity
          onPress={handleIncrement}
          disabled={isAtMax}
          className={`px-4 py-3 ${isAtMax ? "opacity-40" : "opacity-100"}`}
          activeOpacity={0.7}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="rgba(255, 255, 255, 0.9)"
          />
        </TouchableOpacity>
      </View>
      {error && (
        <Text className={`text-red-400 text-xs mt-1 ml-1 ${errorClassName}`}>
          {error}
        </Text>
      )}
    </View>
  );
}
