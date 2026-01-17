import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { APP_COLORS } from '../constants/colors';
import { useTranslation } from '../hooks/use-translation';
import storageService from '../services/storageService';
import wishlistService from '../services/wishlistService';

export default function WishlistScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const authed = await storageService.isAuthenticated();
        if (!authed) {
          setItems([]);
          return;
        }
        const list = await wishlistService.list();
        if (mounted) setItems(Array.isArray(list) ? list : []);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <LinearGradient
      colors={[APP_COLORS.gradientTop, APP_COLORS.gradientBottom]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('games.wishlist')}</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : items.length === 0 ? (
            <Text style={styles.placeholder}>{t('games.wishlist')} vacía</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const cover = item.game_cover || item.game?.cover_image || null;
                const name = item.game_name || item.game?.name || t('common.unknown');
                const genre = item.game_genre || item.game?.genre || '';
                return (
                  <View style={styles.row}>
                    {cover ? (
                      <Image source={{ uri: cover }} style={styles.rowImage} />
                    ) : (
                      <View style={[styles.rowImage, styles.rowImagePlaceholder]} />
                    )}
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{name}</Text>
                      {!!genre && <Text style={styles.rowSubtitle} numberOfLines={1}>{genre}</Text>}
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    color: '#FFFFFF80',
    fontSize: 16,
  },
});
