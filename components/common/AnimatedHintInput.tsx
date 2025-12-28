import { useRef, useState } from "react";
import { Animated, Text, TextInput, View } from "react-native";

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  editable?: boolean;
  error?: string;
}

export default function AnimatedHintInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  editable = true,
  error,
}: Props) {
  const [focused, setFocused] = useState(false);
  const animated = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(animated, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(animated, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const labelTranslateY = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  const labelOpacity = animated;

  return (
    <View className="mb-4">
      {/* Label superior */}
      <Animated.Text
        style={{
          opacity: labelOpacity,
          transform: [{ translateY: labelTranslateY }],
        }}
        className="text-white/80 text-base font-bold pl-2 mb-1"
      >
        {label}
      </Animated.Text>

      {/* Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={editable}
        keyboardType={keyboardType}
        placeholder={focused ? "" : label}
        placeholderTextColor="rgba(255,255,255,0.5)"
        className={`
          border px-4 py-4 rounded-2xl text-white
          ${focused ? "border-dashed border-white" : "border-white/40"}
          ${error ? "border-red-500" : ""}
        `}
      />

      {error && (
        <Text className="text-xs text-red-400 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
