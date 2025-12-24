import { useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface LoginButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
}

export default function LoginButton({ onPress, title, disabled = false }: LoginButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress();
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={disabled ? 1 : 0.9}
        disabled={disabled}
        className="rounded-full py-5 px-12 self-center mb-8 relative overflow-hidden"
        style={{ 
          backgroundColor: disabled ? '#666666' : '#DB0000',
          shadowColor: disabled ? '#666666' : '#DB0000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: disabled ? 0.3 : 0.6,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        <Text className="text-white font-bold text-xl tracking-widest text-center">
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
