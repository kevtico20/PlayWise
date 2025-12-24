import React from "react";
import {
    Text,
    TextInput,
    TextInputProps,
    View
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

export default function Input({
  label,
  error,
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
  errorClassName = "",
  ...textInputProps
}: InputProps) {

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
        className={`bg-white/10 rounded-2xl border-2 ${
          error ? "border-red-400" : "border-white/20"
        }`}
      >
        <TextInput
          className={`px-4 py-3 text-white text-base ${inputClassName}`}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          {...textInputProps}
        />
      </View>
      {error && (
        <Text className={`text-red-400 text-xs mt-1 ml-1 ${errorClassName}`}>
          {error}
        </Text>
      )}
    </View>
  );
}
