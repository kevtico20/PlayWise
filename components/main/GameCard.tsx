import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameCardProps {
  id: string;
  image: string;
  title: string;
  genre: string;
  rating?: number;
  onPress?: () => void;
}

export default function GameCard({ id, image, title, genre, rating, onPress }: GameCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navegar a explore con los datos del juego
      router.push({
        pathname: '/(tabs)/explore',
        params: {
          id,
          title,
          image,
          genre,
          rating: rating?.toString() || '0',
        },
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        style={styles.gradient}
      >
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.genre}>{genre}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  info: {
    padding: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  genre: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.8,
  },
});
