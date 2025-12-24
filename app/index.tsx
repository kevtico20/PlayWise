import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import GradientBackground from '../components/GradientBackground';

export default function Index() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navegar al login después de 3 segundos
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, router]);

  return (
    <GradientBackground className="items-center justify-center">
      <Animated.View 
        style={{ opacity: fadeAnim }}
        className="items-center"
      >
        <Text className="text-6xl font-bold tracking-wider">
          <Text style={{ color: '#6B0F1A' }}>PLAY</Text>
          <Text style={{ color: '#DB0000' }}>WISE</Text>
        </Text>
        <View style={{ backgroundColor: '#DB0000' }} className="h-1 w-48 mt-2" />
      </Animated.View>
    </GradientBackground>
  );
}
