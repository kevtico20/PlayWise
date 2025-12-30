import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

type UseImageCrossfadeProps = {
  images: any[];
  duration?: number;
  interval?: number;
};

export function useImageCrossfade({
  images,
  duration = 1200,
  interval = 4000,
}: UseImageCrossfadeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  const currentOpacity = useRef(new Animated.Value(1)).current;
  const nextOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!images || images.length < 2) return;

    let timeout: ReturnType<typeof setTimeout>;
    let mounted = true;

    const animate = () => {
      if (!mounted) return;

      Animated.parallel([
        Animated.timing(currentOpacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(nextOpacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!mounted) return;

        // Reset valores ANTES del cambio de imagen
        currentOpacity.setValue(1);
        nextOpacity.setValue(0);

        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % images.length);

        timeout = setTimeout(animate, interval);
      });
    };

    timeout = setTimeout(animate, interval);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [nextIndex, images, duration, interval]);

  return {
    currentIndex,
    nextIndex,
    currentOpacity,
    nextOpacity,
  };
}
