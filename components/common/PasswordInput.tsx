import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  showToggle?: boolean;
}

export default function PasswordInput({
  label,
  error,
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
  errorClassName = "",
  showToggle = true,
  ...textInputProps
}: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

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
        <TextInput
          className={`flex-1 px-4 py-3 text-white text-base ${inputClassName}`}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          secureTextEntry={!isPasswordVisible}
          {...textInputProps}
        />
        {showToggle && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="px-4"
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="rgba(255, 255, 255, 0.7)"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className={`text-red-400 text-xs mt-1 ml-1 ${errorClassName}`}>
          {error}
        </Text>
      )}
    </View>
  );
}
