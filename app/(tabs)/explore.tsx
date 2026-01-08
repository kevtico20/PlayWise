import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GradientBackground from '../../components/GradientBackground';
import CommentSection from '../../components/gameDetails/CommentSection';
import GameVariantAccordion from '../../components/gameDetails/GameVariantAccordion';
import MainHeader from '../../components/main/MainHeader';
import { CheapSharkDeal, searchDealsBySteamAppID, searchDealsByTitle, searchDealsByTitleExact } from '../../services/cheapSharkService';
import { getGameDetails, RawgGameFull } from '../../services/rawgService';

// Mock data para comentarios
const MOCK_COMMENTS = [
  { id: '1', userName: 'Heart_beat', text: 'An artist in every sense! Absolutely love his work.', likes: 285, timeAgo: '10min ago' },
  { id: '2', userName: 'Olivia55_12', text: '@Heart_beat He is a legend. One of my favorites!', likes: 63, timeAgo: '21min ago' },
  { id: '3', userName: 'Receptionist77', text: '@Olivia55_12 Each song in this album is a hit', likes: 12, timeAgo: '1h ago' },
];

// Store logos URLs
const STORE_LOGOS: { [key: string]: { uri: string } } = {
  'unknown': { uri: 'https://cdn-icons-png.flaticon.com/512/2354/2354573.png' },
  '1': { uri: 'https://www.cheapshark.com/img/stores/logos/0.png' },
  '2': { uri: 'https://www.cheapshark.com/img/stores/logos/1.png' },
  '3': { uri: 'https://www.cheapshark.com/img/stores/logos/2.png' },
  '4': { uri: 'https://www.cheapshark.com/img/stores/logos/3.png' },
  '5': { uri: 'https://www.cheapshark.com/img/stores/logos/4.png' },
  '6': { uri: 'https://www.cheapshark.com/img/stores/logos/5.png' },
  '7': { uri: 'https://www.cheapshark.com/img/stores/logos/6.png' },
  '8': { uri: 'https://www.cheapshark.com/img/stores/logos/7.png' },
  '9': { uri: 'https://www.cheapshark.com/img/stores/logos/8.png' },
  '10': { uri: 'https://www.cheapshark.com/img/stores/logos/9.png' },
  '11': { uri: 'https://www.cheapshark.com/img/stores/logos/10.png' },
  '12': { uri: 'https://www.cheapshark.com/img/stores/logos/11.png' },
  '13': { uri: 'https://www.cheapshark.com/img/stores/logos/12.png' },
  '14': { uri: 'https://www.cheapshark.com/img/stores/logos/13.png' },
  '15': { uri: 'https://www.cheapshark.com/img/stores/logos/14.png' },
  '16': { uri: 'https://www.cheapshark.com/img/stores/logos/15.png' },
  '17': { uri: 'https://www.cheapshark.com/img/stores/logos/16.png' },
  '18': { uri: 'https://www.cheapshark.com/img/stores/logos/17.png' },
  '19': { uri: 'https://www.cheapshark.com/img/stores/logos/18.png' },
  '20': { uri: 'https://www.cheapshark.com/img/stores/logos/19.png' },
  '21': { uri: 'https://www.cheapshark.com/img/stores/logos/20.png' },
  '22': { uri: 'https://www.cheapshark.com/img/stores/logos/21.png' },
  '24': { uri: 'https://www.cheapshark.com/img/stores/logos/23.png' },
  '25': { uri: 'https://www.cheapshark.com/img/stores/logos/24.png' },
  '26': { uri: 'https://www.cheapshark.com/img/stores/logos/25.png' },
  '27': { uri: 'https://www.cheapshark.com/img/stores/logos/26.png' },
  '28': { uri: 'https://www.cheapshark.com/img/stores/logos/27.png' },
};

const STORE_NAMES: { [key: string]: string } = {
  '1': 'Steam',
  '2': 'GamersGate',
  '3': 'GreenManGaming',
  '4': 'Amazon',
  '5': 'Newegg',
  '6': 'Razer Game Store',
  '7': 'GOG',
  '8': 'Origin',
  '9': 'IndieGameStand',
  '10': 'Desura',
  '11': 'Humble Store',
  '12': 'All Deals',
  '13': 'Ubisoft Connect',
  '14': 'Direct2Drive',
  '15': 'Fanatical',
  '16': 'Gamesload',
  '17': 'Voidu',
  '18': 'GameBillet',
  '19': 'Gamesplanet',
  '20': '2Game',
  '21': 'GMG',
  '22': 'WinGameStore',
  '24': 'GamesRocket',
  '25': 'Epic Games',
  '26': 'Blizzard Shop',
  '27': 'Nintendo',
  '28': 'Meta Quest',
};

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const gameId = (params.id as string) || '3328';
  const gameTitle = (params.title as string) || 'Elden Ring';
  const gameImage = (params.image as string) || 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png';
  const gameGenre = (params.genre as string) || 'RPG';
  const gameRating = parseFloat((params.rating as string) || '4.8');

  const [deals, setDeals] = useState<CheapSharkDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [gameDetails, setGameDetails] = useState<RawgGameFull | null>(null);
  const [description, setDescription] = useState('');
  const [detailedRating, setDetailedRating] = useState<number>(gameRating);
  const [descriptionLevel, setDescriptionLevel] = useState(0); // 0=200, 1=400, 2=800, 3=full
  const [genres, setGenres] = useState<string[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Detect horizontal swipe right from left edge
        return gestureState.dx > 10 && Math.abs(gestureState.dy) < 80;
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swipe right more than 100px, navigate back
        if (gestureState.dx > 100) {
          router.push('/(tabs)/main');
        }
      },
    })
  ).current;

  useEffect(() => {
    loadGameData();
  }, [gameId, gameTitle]);

  const loadGameData = async () => {
    try {
      setLoading(true);

      if (gameId && gameId !== '3328') {
        const details = await getGameDetails(gameId);
        setGameDetails(details);
        setDescription(details.description_raw || details.description || '');
        if (details.rating) {
          setDetailedRating(details.rating);
        }
        if (details.genres && Array.isArray(details.genres)) {
          setGenres(details.genres.map((g: any) => g.name));
        }
      }

      // Try to resolve the correct game in CheapShark using Steam App ID first, then exact title, then fallback
      let results: CheapSharkDeal[] = [];

      // Helper: extract Steam App ID from RAWG details stores (Steam URLs contain /app/<id>/)
      const extractSteamAppId = (details: any): string | null => {
        try {
          const stores = details?.stores || [];
          for (const s of stores) {
            const url: string = s?.url || s?.store?.url || '';
            const m = url.match(/store\.steampowered\.com\/app\/(\d+)/i);
            if (m && m[1]) return m[1];
          }
          // Sometimes RAWG provides 'metacritic_url' or other links; attempt generic /app/<id>/ scan
          const text = JSON.stringify(details || {});
          const g = text.match(/store\.steampowered\.com\/app\/(\d+)/i);
          if (g && g[1]) return g[1];
        } catch {}
        return null;
      };

      const steamAppId = gameDetails ? extractSteamAppId(gameDetails) : null;

      if (steamAppId) {
        try {
          results = await searchDealsBySteamAppID(steamAppId, 60);
        } catch {}
      }

      if (!results || results.length === 0) {
        try {
          results = await searchDealsByTitleExact(gameTitle, 60);
        } catch {}
      }

      // Fallback to broad search
      if (!results || results.length === 0) {
        results = await searchDealsByTitle(gameTitle, 60);
      }

      // If title contains a year like (2013), prefer deals that include that year in title
      const yearMatch = gameTitle.match(/\((\d{4})\)/);
      if (yearMatch) {
        const year = yearMatch[1];
        const filtered = results.filter((d) => (d.title || '').includes(`(${year})`));
        if (filtered.length > 0) {
          results = filtered;
        }
      }

      // Normalize title filtering: prefer deals whose title starts with the base title (without year)
      const baseTitle = gameTitle.replace(/\(\d{4}\)/, '').trim().toLowerCase();
      const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
      const preferred = results.filter((d) => {
        const dt = normalize(d.title || '');
        const bt = normalize(baseTitle);
        return dt.startsWith(bt);
      });
      if (preferred.length > 0) {
        results = preferred;
      }

      setDeals(results);
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dealsByTitle = deals.reduce((acc, deal) => {
    const title = deal.title || gameTitle;
    const storeId = deal.storeID;

    // Skip deals without a store ID to avoid duplicating Steam as fallback
    if (!storeId) return acc;

    if (!acc[title]) {
      acc[title] = {};
    }

    const currentPrice = parseFloat(deal.salePrice || deal.normalPrice || '999');
    const existingPrice = acc[title][storeId]
      ? parseFloat(acc[title][storeId].salePrice || acc[title][storeId].normalPrice || '999')
      : Number.POSITIVE_INFINITY;

    if (!acc[title][storeId] || currentPrice < existingPrice) {
      acc[title][storeId] = deal;
    }
    return acc;
  }, {} as Record<string, Record<string, CheapSharkDeal>>);

  const sortedTitles = Object.keys(dealsByTitle).sort(
    (a, b) => Object.keys(dealsByTitle[b]).length - Object.keys(dealsByTitle[a]).length
  );

  // Debug: log the stores and prices we have per title
  React.useEffect(() => {
    const debugPayload = sortedTitles.map((title) => ({
      title,
      stores: Object.values(dealsByTitle[title]).map((deal) => ({
        storeID: deal.storeID,
        storeName: deal.storeID ? STORE_NAMES[deal.storeID] || 'Unknown' : 'Unknown',
        salePrice: deal.salePrice,
        normalPrice: deal.normalPrice,
      })),
    }));

    console.log('DEALS_DEBUG', JSON.stringify(debugPayload, null, 2));
  }, [deals]);

  const handleAddComment = (text: string) => {
    const newComment = { id: Date.now().toString(), userName: 'You', text, likes: 0, timeAgo: 'Just now' };
    setComments([newComment, ...comments]);
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment
      )
    );
  };

  const getDescriptionText = () => {
    if (!description) return 'No description available';
    
    const limits = [200, 400, 800];
    if (descriptionLevel < limits.length) {
      const limit = limits[descriptionLevel];
      return description.length > limit ? description.substring(0, limit) + '...' : description;
    }
    return description;
  };

  const handleDescriptionToggle = () => {
    if (descriptionLevel === 3 || description.length <= 200) {
      setDescriptionLevel(0);
    } else {
      setDescriptionLevel(descriptionLevel + 1);
    }
  };

  const showDescriptionButton = description.length > 200;

  return (
    <GradientBackground>
      <View {...panResponder.panHandlers} style={styles.gestureArea} />
      <MainHeader />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.coverContainer}>
          <Image source={{ uri: gameImage }} style={styles.cover} resizeMode="cover" />
        </View>

        <Text style={styles.title}>{gameTitle}</Text>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>★ {detailedRating.toFixed(1)}</Text>
        </View>

        {genres.length > 0 && (
          <View style={styles.genresContainer}>
            {genres.map((genre, index) => (
              <View key={index} style={styles.genreBadge}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {getDescriptionText()}
        </Text>
        {showDescriptionButton && (
          <TouchableOpacity onPress={handleDescriptionToggle} style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>
              {descriptionLevel === 3 ? 'Ver menos' : 'Ver más'}
            </Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
        ) : (
          <>
            {sortedTitles.map((title, sectionIndex) => {
              const storeDeals = Object.values(dealsByTitle[title]).sort((a, b) => {
                const aPrice = parseFloat(a.salePrice || a.normalPrice || '999');
                const bPrice = parseFloat(b.salePrice || b.normalPrice || '999');
                return aPrice - bPrice;
              });

              return storeDeals.length > 0 ? (
                <GameVariantAccordion
                  key={sectionIndex}
                  title={title}
                  deals={storeDeals}
                  storeLogos={STORE_LOGOS}
                  storeNames={STORE_NAMES}
                  isFirst={sectionIndex === 0}
                />
              ) : null;
            })}
          </>
        )}

        <CommentSection comments={comments} onAddComment={handleAddComment} onLikeComment={handleLikeComment} />

        <View style={styles.spacer} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  gestureArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: '100%',
    zIndex: 5,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  cover: {
    width: 164,
    height: 231,
    borderRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 8,
  },
  genreBadge: {
    backgroundColor: 'rgba(74, 158, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(74, 158, 255, 0.4)',
  },
  genreText: {
    color: '#4A9EFF',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B0B0B0',
    textAlign: 'left',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 11,
    fontWeight: '300',
    color: '#E0E0E0',
    textAlign: 'left',
    lineHeight: 15,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  seeMoreButton: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 12,
  },
  seeMoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A9EFF',
    textAlign: 'left',
  },
  loader: {
    marginVertical: 30,
  },
  spacer: {
    height: 40,
  },
});

