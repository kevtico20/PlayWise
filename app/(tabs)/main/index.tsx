import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native';
import GameSection from '../../../components/main/GameSection';
import HeroSection from '../../../components/main/HeroSection';
import ErrorBoundary from '../../../components/common/ErrorBoundary';
import ScreenSuspense from '../../../components/common/ScreenSuspense';
import SectionSkeleton from '../../../components/common/SectionSkeleton';
import MainHeader from '../../../components/main/MainHeader';
import MainFooter from '../../../components/common/MainFooter';
import { APP_COLORS } from '../../../constants/colors';
import GAME_CATEGORIES from '../../../constants/gameCategories';
import { getGamesByGenre, RawgGameShort, getTopRatedGames } from '../../../services/rawgService';

// Hero images will be loaded dynamically from RAWG (top-rated games)

const recommendedGames = [
  {
    id: '1',
    image: 'https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d',
    title: 'ResidentEvil Village',
    genre: 'Horror-Action',
  },
  {
    id: '2',
    image: 'https://www.figma.com/api/mcp/asset/d67d3804-4946-42c3-b56f-fb119fc73124',
    title: 'RedDead Redemption II',
    genre: 'RPG-Action',
  },
  {
    id: '3',
    image: 'https://www.figma.com/api/mcp/asset/709218ad-892c-4f70-ab7b-1faf74e82e15',
    title: 'BattleField 1',
    genre: 'Shooter-Action',
  },
  {
    id: '4',
    image: 'https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d',
    title: 'RedDead Redemption II',
    genre: 'Horror-Action',
  },
];

const awardWinningGames = [
  {
    id: '5',
    image: 'https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d',
    title: 'ResidentEvil Village',
    genre: 'Horror-Action',
  },
  {
    id: '6',
    image: 'https://www.figma.com/api/mcp/asset/d67d3804-4946-42c3-b56f-fb119fc73124',
    title: 'RedDead Redemption II',
    genre: 'RPG-Action',
  },
  {
    id: '7',
    image: 'https://www.figma.com/api/mcp/asset/709218ad-892c-4f70-ab7b-1faf74e82e15',
    title: 'BattleField 1',
    genre: 'Shooter-Action',
  },
  {
    id: '8',
    image: 'https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d',
    title: 'RedDead Redemption II',
    genre: 'Horror-Action',
  },
];

const classicGames = [
  {
    id: '9',
    image: 'https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d',
    title: 'ResidentEvil Village',
    genre: 'Horror-Action',
  },
  {
    id: '10',
    image: 'https://www.figma.com/api/mcp/asset/d67d3804-4946-42c3-b56f-fb119fc73124',
    title: 'RedDead Redemption II',
    genre: 'RPG-Action',
  },
  {
    id: '11',
    image: 'https://www.figma.com/api/mcp/asset/709218ad-892c-4f70-ab7b-1faf74e82e15',
    title: 'BattleField 1',
    genre: 'Shooter-Action',
  },
  {
    id: '12',
    image: 'https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d',
    title: 'RedDead Redemption II',
    genre: 'Horror-Action',
  },
];

interface Game {
  id: string;
  image: string;
  title: string;
  genre: string;
}

type CategoryState = {
  games: Game[];
  page: number;
  loading: boolean;
  hasMore: boolean;
};

export default function MainScreen() {
  const [categoriesData, setCategoriesData] = useState<Record<string, CategoryState>>(() => {
    const init: Record<string, CategoryState> = {};
    GAME_CATEGORIES.forEach((c) => {
      init[c.key] = { games: [], page: 0, loading: false, hasMore: true };
    });
    return init;
  });

  const [heroGames, setHeroGames] = useState<{
    image: string;
    title: string;
    description: string;
    genre: string;
    rating: number;
  }[]>([]);

  const PAGE_SIZE = 6;

  function mapRawg(item: RawgGameShort): Game {
    return {
      id: String(item.id),
      image: item.background_image || '',
      title: item.name,
      genre: item.genres && item.genres.length ? item.genres[0].name : '',
    };
  }

  async function loadCategory(key: string, pageToLoad = 1) {
    const cat = GAME_CATEGORIES.find((c) => c.key === key);
    if (!cat) return;

    setCategoriesData((prev) => ({
      ...prev,
      [key]: { ...prev[key], loading: true },
    }));

    try {
      const resp = await getGamesByGenre(cat.rawgSlug, pageToLoad, PAGE_SIZE);
      const items = (resp.results || []).map(mapRawg);

      setCategoriesData((prev) => {
        const prevGames = pageToLoad === 1 ? [] : prev[key].games;
        const merged = [...prevGames, ...items];
        return {
          ...prev,
          [key]: {
            games: merged,
            page: pageToLoad,
            loading: false,
            hasMore: (resp.results || []).length === PAGE_SIZE,
          },
        };
      });
    } catch (err) {
      console.warn('Error loading category', key, err);
      setCategoriesData((prev) => ({ ...prev, [key]: { ...prev[key], loading: false } }));
    }
  }

  useEffect(() => {
    // Load first page for each category in parallel
    GAME_CATEGORIES.forEach((c) => {
      loadCategory(c.key, 1);
    });
    // Load top-rated games for hero
    (async () => {
      try {
        const tops = await getTopRatedGames(1, 5);
        const mapped = tops.map((t) => ({
          image: t.background_image || '',
          title: t.name,
          description: (t as any).description_raw || '',
          genre: t.genres && t.genres.length ? t.genres[0].name : '',
          rating: t.rating || 0,
        }));
        setHeroGames(mapped);
        // Debug: print top games info (title, rating, truncated description) to help inspect RAWG response
        // try {
        //   // eslint-disable-next-line no-console
        //   console.log('[DEBUG] Top hero games: ' + JSON.stringify(
        //     mapped.map(m => ({ title: m.title, rating: m.rating, description: (m.description || '').slice(0, 200) })),
        //     null,
        //     2
        //   ));
        // } catch (e) {
        //   // ignore
        // }
      } catch (err) {
        console.warn('Error loading top-rated games', err);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[APP_COLORS.gradientTop, APP_COLORS.gradientBottom]}
        style={styles.gradient}
      >
          <SafeAreaView style={styles.safeArea}>
          {/* Suspense-like loading UI while main content loads */}
          <ScreenSuspense
            loading={
              heroGames.length === 0 &&
              Object.values(categoriesData).every((s) => (s.games || []).length === 0)
            }
          >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroContainer}>
              {/* Hero: show skeleton until heroGames are loaded */}
              {heroGames.length === 0 ? (
                <View style={{ height: 340, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#fff' }}>Cargando hero...</Text>
                </View>
              ) : (
                <ErrorBoundary>
                  <HeroSection games={heroGames} />
                </ErrorBoundary>
              )}
              <MainHeader userName="K" />
            </View>

            {GAME_CATEGORIES.map((cat) => (
              categoriesData[cat.key] && categoriesData[cat.key].games && categoriesData[cat.key].games.length > 0 ? (
                <GameSection
                  key={cat.key}
                  title={cat.title}
                  games={categoriesData[cat.key]?.games || []}
                  onLoadMore={() => {
                    const state = categoriesData[cat.key];
                    if (!state || state.loading || !state.hasMore) return;
                    loadCategory(cat.key, state.page + 1);
                  }}
                  isLoadingMore={categoriesData[cat.key]?.loading}
                />
              ) : (
                // Show per-section skeleton while this category is empty
                <View key={cat.key} style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#fff', marginLeft: 12, marginBottom: 8 }}>{cat.title}</Text>
                  <View style={{ paddingHorizontal: 12 }}>
                    <SectionSkeleton />
                  </View>
                </View>
              )
            ))}
            {/* Footer at the end of the content */}
            <View style={{ paddingTop: 12 }}>
              <MainFooter />
            </View>
          </ScrollView>
          </ScreenSuspense>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
  },
});
