import { Eye, EyeOff } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  error?: string;
}

export default function AnimatedHintPasswordInput({
  label,
  value,
  onChangeText,
  editable = true,
  error,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(true);

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
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          secureTextEntry={secure}
          placeholder={focused ? "" : label}
          placeholderTextColor="rgba(255,255,255,0.5)"
          className={`
            border px-4 py-4 pr-12 rounded-2xl text-white
            ${focused ? "border-dashed border-white" : "border-white/40"}
            ${error ? "border-red-500" : ""}
          `}
        />

        {/* Toggle visibility */}
        <TouchableOpacity
          onPress={() => setSecure(!secure)}
          activeOpacity={0.7}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {secure ? (
            <Eye size={20} color="white" />
          ) : (
            <EyeOff size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <Text className="text-xs text-red-400 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
