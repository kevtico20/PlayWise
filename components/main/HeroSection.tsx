import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeroGame {
  image: string;
  title: string;
  description: string;
  genre: string;
  rating: number;
}

interface HeroSectionProps {
  games: HeroGame[];
  duration?: number;
  interval?: number;
}

export default function HeroSection({ games, duration = 1200, interval = 5000 }: HeroSectionProps) {
  // DEBUG: log entry to help trace why placeholder was showing and where errors occur
  // Metro will show these logs in the console. Remove or lower verbosity when fixed.
  // eslint-disable-next-line no-console
  console.log('[HeroSection] render - games length =', games ? games.length : 0);
  if (!games || games.length === 0) return null;

  // NOTE: DEBUG minimal render removed — restoring full hero UI for step 1 (gestures still disabled)
  // Usar state solo para forzar re-render cuando sea necesario (para mostrar el juego actual)
  const [displayIndex, setDisplayIndex] = useState(0);

  // Index refs to avoid stale closures in animation callbacks
  const currentIndexRef = useRef(0);
  const nextIndexRef = useRef(1);

  // Animated values for crossfade and progress indicators
  const imageOpacitiesRef = useRef<Animated.Value[]>([]);
  const progressAnimsRef = useRef<Animated.Value[]>([]);
  const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Don't capture arrays in closures; always read current arrays from refs when animating

  // Re-inicializar Animated.Value arrays cada vez que cambie la lista de juegos
  useEffect(() => {
    imageOpacitiesRef.current = games.map((_, i) => new Animated.Value(i === 0 ? 1 : 0));
    progressAnimsRef.current = games.map(() => new Animated.Value(0));
    // reset index refs and display
    currentIndexRef.current = 0;
    nextIndexRef.current = games.length > 1 ? 1 : 0;
    setDisplayIndex(0);
  }, [games]);

  // Safety sync-init: ensure arrays exist during first render (prevents undefined access
  // when games are loaded asynchronously and the render happens before the effect runs).
  if (imageOpacitiesRef.current.length !== games.length) {
    imageOpacitiesRef.current = games.map((_, i) => new Animated.Value(i === 0 ? 1 : 0));
  }
  if (progressAnimsRef.current.length !== games.length) {
    progressAnimsRef.current = games.map(() => new Animated.Value(0));
  }

  // Refs para los parámetros
  const durationRef = useRef(duration);
  const intervalRef = useRef(interval);

  useEffect(() => {
    durationRef.current = duration;
    intervalRef.current = interval;
  }, [duration, interval]);

  // Crossfade automático - reinicia cuando cambie la lista de juegos
  useEffect(() => {
    if (!games || games.length < 2) return;

    // eslint-disable-next-line no-console
    console.log('[HeroSection] starting auto crossfade, count=', games.length);

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const animate = () => {
      if (!isMounted) return;

      const curIdx = currentIndexRef.current;
      const nxtIdx = (curIdx + 1) % games.length;

      const curAnim = imageOpacitiesRef.current[curIdx];
      const nxtAnim = imageOpacitiesRef.current[nxtIdx];
      if (!curAnim || !nxtAnim) {
        console.warn('[HeroSection] animate: missing anim values', { curIdx, nxtIdx });
        return;
      }

      // Reset progress values
      progressAnimsRef.current.forEach((p, i) => p.setValue(i <= curIdx ? 1 : 0));

      Animated.parallel([
        Animated.timing(curAnim, {
          toValue: 0,
          duration: durationRef.current,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(nxtAnim, {
          toValue: 1,
          duration: durationRef.current,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isMounted) return;

        currentIndexRef.current = nxtIdx;
        nextIndexRef.current = (nxtIdx + 1) % games.length;
        setDisplayIndex(nxtIdx);

        animateProgressBar(nxtIdx);

        timeoutId = setTimeout(animate, intervalRef.current);
      });
    };

    // kick off
    animateProgressBar(0);
    timeoutId = setTimeout(animate, intervalRef.current);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      progressAnimRef.current?.stop?.();
    };
  }, [games]);

  const animateProgressBar = (index: number) => {
    const currentProgressAnims = progressAnimsRef.current;
    if (!currentProgressAnims || !currentProgressAnims[index]) {
      console.warn('[HeroSection] animateProgressBar: missing progress anim for index', index);
      currentProgressAnims.forEach((p, i) => p.setValue(i < index ? 1 : 0));
      return;
    }

    // reset others
    currentProgressAnims.forEach((p, i) => {
      if (i !== index) p.setValue(i < index ? 1 : 0);
    });

    // animate current progress with native driver using scaleX
    progressAnimRef.current = Animated.timing(currentProgressAnims[index], {
      toValue: 1,
      duration: intervalRef.current,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    progressAnimRef.current.start();
  };

  // Función para cambio manual
  const goToSlide = (index: number) => {
    if (index === currentIndexRef.current) return;

  // progressAnimRef reset
  progressAnimRef.current = null;

  // Resetear progreso (set Animated.Value to 0)
  progressAnimsRef.current.forEach((p) => p.setValue(0));

    const curIdx = currentIndexRef.current;
    const nxtIdx = index;

    // Defensive: ensure animated values exist
    const curAnim = imageOpacitiesRef.current[curIdx];
    const nxtAnim = imageOpacitiesRef.current[nxtIdx];
    if (!curAnim || !nxtAnim) {
      console.warn('[HeroSection] goToSlide: missing image opacity anim', { curIdx, nxtIdx });
      currentIndexRef.current = nxtIdx;
      nextIndexRef.current = games.length > 1 ? (nxtIdx + 1) % games.length : nxtIdx;
      setDisplayIndex(nxtIdx);
      animateProgressBar(nxtIdx);
      return;
    }

    Animated.parallel([
      Animated.timing(curAnim, {
        toValue: 0,
        duration: durationRef.current,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(nxtAnim, {
        toValue: 1,
        duration: durationRef.current,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      currentIndexRef.current = nxtIdx;
      nextIndexRef.current = (nxtIdx + 1) % games.length;
      setDisplayIndex(nxtIdx);
      animateProgressBar(nxtIdx);
    });
  };

  // Función para ir a la siguiente imagen
  const goToNext = () => {
    const next = (currentIndexRef.current + 1) % games.length;
    goToSlide(next);
  };

  // Función para ir a la imagen anterior
  const goToPrevious = () => {
    const prev = (currentIndexRef.current - 1 + games.length) % games.length;
    goToSlide(prev);
  };

  // NOTE: Gestures temporarily disabled for debugging. If tests show error disappears,
  // we will re-enable and bisect gesture configuration.

  const currentGame = games[displayIndex];

  return (
    <View style={styles.container}>
        {/* Background Image (single, no Animated) - simplified for debugging */}
        <View style={styles.imageContainer}>
          {games.map((game, i) => {
            const fallback = require('../../assets/loginImages/img1.jpg');
            const source = game?.image ? { uri: game.image } : fallback;
            const opacity = imageOpacitiesRef.current[i] || new Animated.Value(0);
            return (
              <Animated.View
                key={i}
                style={[styles.backgroundImage, { opacity, backgroundColor: '#000' }]}
              >
                <Image source={source} style={styles.backgroundImage} resizeMode="cover" />
              </Animated.View>
            );
          })}
        </View>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(1, 0, 9, 0)', 'rgba(1, 0, 9, 0.41)']}
          locations={[0.8, 0.9]}
          style={styles.gradientOverlay}
        />

        {/* Global dark overlay to improve text contrast over bright images */}
        <View style={styles.imageOverlay} pointerEvents="none" />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{currentGame.title}</Text>

          {/* Rating Stars (round rating to nearest integer, cap 0-5) */}
          <View style={styles.ratingContainer}>
            {(() => {
              const stars = Math.max(0, Math.min(5, Math.round(currentGame.rating || 0)));
              return [...Array(5)].map((_, index) => (
                <Text key={index} style={styles.star}>
                  {index < stars ? '⭐' : '☆'}
                </Text>
              ));
            })()}
          </View>

          <Text style={styles.description} numberOfLines={3}>
            {currentGame.description}
          </Text>

          <Text style={styles.genre}>{currentGame.genre}</Text>

          {/* Progress Indicators */}
          <View style={styles.indicators}>
            {games.map((_, index) => {
              // Render static indicators (no Animated.interpolate) to isolate runtime errors
              const filled = index < displayIndex;
              const active = index === displayIndex;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => goToSlide(index)}
                  activeOpacity={0.7}
                  style={styles.indicatorTouchable}
                >
                  <View style={styles.indicatorBackground}>
                    {progressAnimsRef.current[index] ? (
                      <Animated.View
                        style={[
                          styles.indicatorProgress,
                          {
                            transform: [
                              {
                                scaleX: progressAnimsRef.current[index],
                              },
                            ],
                            backgroundColor: active ? '#D21718' : '#D9D9D9',
                            alignSelf: 'flex-start',
                            width: '100%',
                          },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.indicatorProgress,
                          {
                            width: filled ? '100%' : '0%',
                            backgroundColor: active ? '#D21718' : '#D9D9D9',
                          },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 340,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 324,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 324,
    width: '100%',
    zIndex: 2,
  },
  content: {
    position: 'absolute',
    bottom: 20,
    left: 11,
    right: 11,
    zIndex: 3,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 12,
    marginRight: 2,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    marginBottom: 8,
    maxWidth: 344,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  genre: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 12,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicatorTouchable: {
    width: 28,
    height: 5,
  },
  indicatorBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D9D9D9',
    borderRadius: 34,
    overflow: 'hidden',
  },
  indicatorProgress: {
    height: '100%',
    borderRadius: 34,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 324,
    backgroundColor: 'rgba(0,0,0,0.28)',
    zIndex: 2,
  },
});
