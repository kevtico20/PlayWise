import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';

type Props = React.PropsWithChildren<{
  loading: boolean;
}>;

export default function ScreenSuspense({ loading, children }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  if (!loading) return children as any;

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.heroSkeleton, { opacity }]} />
      <View style={styles.sections}>
        <View style={styles.sectionRow}>
          <Animated.View style={[styles.cardSkeleton, { opacity }]} />
          <Animated.View style={[styles.cardSkeleton, { opacity }]} />
          <Animated.View style={[styles.cardSkeleton, { opacity }]} />
        </View>
        <View style={styles.sectionRow}>
          <Animated.View style={[styles.cardSkeleton, { opacity }]} />
          <Animated.View style={[styles.cardSkeleton, { opacity }]} />
          <Animated.View style={[styles.cardSkeleton, { opacity }]} />
        </View>
      </View>
      <Text style={styles.loadingText}>Cargando contenido...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  heroSkeleton: {
    width: '94%',
    height: 320,
    borderRadius: 12,
    backgroundColor: '#222',
    marginBottom: 16,
  },
  sections: {
    width: '100%',
    paddingHorizontal: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardSkeleton: {
    width: '32%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  loadingText: {
    color: '#ddd',
    marginTop: 12,
    fontSize: 12,
  },
});
