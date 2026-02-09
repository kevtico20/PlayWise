import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorBoundary from "../../../components/common/ErrorBoundary";
import MainFooter from "../../../components/common/MainFooter";
import ScreenSuspense from "../../../components/common/ScreenSuspense";
import SectionSkeleton from "../../../components/common/SectionSkeleton";
import GameSection from "../../../components/main/GameSection";
import HeroSection from "../../../components/main/HeroSection";
import MainHeader from "../../../components/main/MainHeader";
import RecommendationsSection from "../../../components/main/RecommendationsSection";
import { APP_COLORS } from "../../../constants/colors";
import GAME_CATEGORIES from "../../../constants/gameCategories";
import { useTranslation } from "../../../hooks/use-translation";
import {
    getGamesByGenre,
    getTopRatedGames,
    RawgGameShort,
} from "../../../services/rawgService";
import wishlistService from "../../../services/wishlistService";

// Hero images will be loaded dynamically from RAWG (top-rated games)

const recommendedGames = [
  {
    id: "1",
    image:
      "https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d",
    title: "ResidentEvil Village",
    genre: "Horror-Action",
  },
  {
    id: "2",
    image:
      "https://www.figma.com/api/mcp/asset/d67d3804-4946-42c3-b56f-fb119fc73124",
    title: "RedDead Redemption II",
    genre: "RPG-Action",
  },
  {
    id: "3",
    image:
      "https://www.figma.com/api/mcp/asset/709218ad-892c-4f70-ab7b-1faf74e82e15",
    title: "BattleField 1",
    genre: "Shooter-Action",
  },
  {
    id: "4",
    image:
      "https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d",
    title: "RedDead Redemption II",
    genre: "Horror-Action",
  },
];

const awardWinningGames = [
  {
    id: "5",
    image:
      "https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d",
    title: "ResidentEvil Village",
    genre: "Horror-Action",
  },
  {
    id: "6",
    image:
      "https://www.figma.com/api/mcp/asset/d67d3804-4946-42c3-b56f-fb119fc73124",
    title: "RedDead Redemption II",
    genre: "RPG-Action",
  },
  {
    id: "7",
    image:
      "https://www.figma.com/api/mcp/asset/709218ad-892c-4f70-ab7b-1faf74e82e15",
    title: "BattleField 1",
    genre: "Shooter-Action",
  },
  {
    id: "8",
    image:
      "https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d",
    title: "RedDead Redemption II",
    genre: "Horror-Action",
  },
];

const classicGames = [
  {
    id: "9",
    image:
      "https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d",
    title: "ResidentEvil Village",
    genre: "Horror-Action",
  },
  {
    id: "10",
    image:
      "https://www.figma.com/api/mcp/asset/d67d3804-4946-42c3-b56f-fb119fc73124",
    title: "RedDead Redemption II",
    genre: "RPG-Action",
  },
  {
    id: "11",
    image:
      "https://www.figma.com/api/mcp/asset/709218ad-892c-4f70-ab7b-1faf74e82e15",
    title: "BattleField 1",
    genre: "Shooter-Action",
  },
  {
    id: "12",
    image:
      "https://www.figma.com/api/mcp/asset/6ccd8db6-fdc4-434c-b6f4-356de3f60c3d",
    title: "RedDead Redemption II",
    genre: "Horror-Action",
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
  const { t } = useTranslation();

  const [categoriesData, setCategoriesData] = useState<
    Record<string, CategoryState>
  >(() => {
    const init: Record<string, CategoryState> = {};
    GAME_CATEGORIES.forEach((c) => {
      init[c.key] = { games: [], page: 0, loading: false, hasMore: true };
    });
    return init;
  });

  const [heroGames, setHeroGames] = useState<
    {
      image: string;
      title: string;
      description: string;
      genre: string;
      rating: number;
    }[]
  >([]);

  // Estado para la wishlist - almacena los api_ids de juegos en wishlist
  const [wishlistGameIds, setWishlistGameIds] = useState<string[]>([]);
  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({});

  const PAGE_SIZE = 6;

  function mapRawg(item: RawgGameShort): Game {
    return {
      id: String(item.id),
      image: item.background_image || "",
      title: item.name,
      genre: item.genres && item.genres.length ? item.genres[0].name : "",
    };
  }

  const refreshWishlist = useCallback(async () => {
    try {
      console.log("🔄 Cargando wishlist del usuario...");
      const wishlist = await wishlistService.list();

      const apiIds = wishlist
        .map((item: any) => item.game_api_id)
        .filter(Boolean);

      const map: Record<string, string> = {};
      wishlist.forEach((item: any) => {
        const apiId = item.game_api_id;
        const wishlistId = item.id || item.wishlist_id;
        if (apiId && wishlistId) {
          map[String(apiId)] = String(wishlistId);
        }
      });

      setWishlistGameIds(apiIds);
      setWishlistMap(map);
      console.log(`✅ Wishlist cargada: ${apiIds.length} juegos`, apiIds);
    } catch (err) {
      console.warn(
        "⚠️ Error cargando wishlist (usuario no autenticado?):",
        err,
      );
      setWishlistGameIds([]);
      setWishlistMap({});
    }
  }, []);

  const handleToggleWishlist = async (game: Game) => {
    const apiId = game.id;
    const wishlistId = wishlistMap[apiId];

    try {
      if (wishlistId) {
        await wishlistService.removeByWishlistId(wishlistId);
        setWishlistGameIds((prev) => prev.filter((id) => id !== apiId));
        setWishlistMap((prev) => {
          const { [apiId]: _, ...rest } = prev;
          return rest;
        });
      } else {
        await wishlistService.addByApiId({
          api_id: apiId,
          name: game.title,
          genre: game.genre,
          cover_image: game.image,
        });
        await refreshWishlist();
      }
    } catch (err) {
      console.warn("⚠️ No se pudo actualizar la wishlist:", err);
    }
  };

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
      console.warn("Error loading category", key, err);
      setCategoriesData((prev) => ({
        ...prev,
        [key]: { ...prev[key], loading: false },
      }));
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
          image: t.background_image || "",
          title: t.name,
          description: (t as any).description_raw || "",
          genre: t.genres && t.genres.length ? t.genres[0].name : "",
          rating: t.rating || 0,
        }));
        setHeroGames(mapped);
      } catch (err) {
        console.warn("Error loading top-rated games", err);
      }
    })();
    refreshWishlist();
  }, [refreshWishlist]);

  // Refrescar wishlist cada vez que la pestaña Main recupera foco
  useFocusEffect(
    useCallback(() => {
      refreshWishlist();
    }, [refreshWishlist]),
  );

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[APP_COLORS.gradientTop, APP_COLORS.gradientBottom]}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          {/* Suspense-like loading UI while main content loads */}
          <ScreenSuspense
            loading={
              heroGames.length === 0 &&
              Object.values(categoriesData).every(
                (s) => (s.games || []).length === 0,
              )
            }
          >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="relative">
                {/* Hero: show skeleton until heroGames are loaded */}
                {heroGames.length === 0 ? (
                  <View className="h-[340] w-full items-center justify-center">
                    <Text className="text-white">{t("games.loadingHero")}</Text>
                  </View>
                ) : (
                  <ErrorBoundary>
                    <HeroSection games={heroGames} />
                  </ErrorBoundary>
                )}

                <MainHeader />
              </View>

              {/* AI Recommendations Section */}
              <ErrorBoundary>
                <RecommendationsSection wishlistGameIds={wishlistGameIds} />
              </ErrorBoundary>

              {GAME_CATEGORIES.map((cat) =>
                categoriesData[cat.key] &&
                categoriesData[cat.key].games &&
                categoriesData[cat.key].games.length > 0 ? (
                  <GameSection
                    key={cat.key}
                    title={t(cat.title)}
                    games={categoriesData[cat.key]?.games || []}
                    wishlistGameIds={wishlistGameIds}
                    onLoadMore={() => {
                      const state = categoriesData[cat.key];
                      if (!state || state.loading || !state.hasMore) return;
                      loadCategory(cat.key, state.page + 1);
                    }}
                    isLoadingMore={categoriesData[cat.key]?.loading}
                  />
                ) : (
                  // Show per-section skeleton while this category is empty
                  <View key={cat.key} className="mb-3">
                    <Text className="text-white ml-3 mb-2">{cat.title}</Text>
                    <View className="px-3">
                      <SectionSkeleton />
                    </View>
                  </View>
                ),
              )}

              {/* Footer at the end of the content */}
              <View className="pt-3">
                <MainFooter />
              </View>
            </ScrollView>
          </ScreenSuspense>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
