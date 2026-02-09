import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  PanResponder,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GradientBackground from "../../components/GradientBackground";
import CommentSection from "../../components/gameDetails/CommentSection";
import GameVariantAccordion from "../../components/gameDetails/GameVariantAccordion";
import MainHeader from "../../components/main/MainHeader";
import { useTranslation } from "../../hooks/use-translation";
import {
  CheapSharkDeal,
  searchDealsBySteamAppID,
  searchDealsByTitle,
  searchDealsByTitleExact,
} from "../../services/cheapSharkService";
import commentService from "../../services/commentService";
import { getGameDetails, RawgGameFull } from "../../services/rawgService";
import wishlistService from "../../services/wishlistService";

// Store logos URLs
const STORE_LOGOS: { [key: string]: { uri: string } } = {
  unknown: { uri: "https://cdn-icons-png.flaticon.com/512/2354/2354573.png" },
  "1": { uri: "https://www.cheapshark.com/img/stores/logos/0.png" },
  "2": { uri: "https://www.cheapshark.com/img/stores/logos/1.png" },
  "3": { uri: "https://www.cheapshark.com/img/stores/logos/2.png" },
  "4": { uri: "https://www.cheapshark.com/img/stores/logos/3.png" },
  "5": { uri: "https://www.cheapshark.com/img/stores/logos/4.png" },
  "6": { uri: "https://www.cheapshark.com/img/stores/logos/5.png" },
  "7": { uri: "https://www.cheapshark.com/img/stores/logos/6.png" },
  "8": { uri: "https://www.cheapshark.com/img/stores/logos/7.png" },
  "9": { uri: "https://www.cheapshark.com/img/stores/logos/8.png" },
  "10": { uri: "https://www.cheapshark.com/img/stores/logos/9.png" },
  "11": { uri: "https://www.cheapshark.com/img/stores/logos/10.png" },
  "12": { uri: "https://www.cheapshark.com/img/stores/logos/11.png" },
  "13": { uri: "https://www.cheapshark.com/img/stores/logos/12.png" },
  "14": { uri: "https://www.cheapshark.com/img/stores/logos/13.png" },
  "15": { uri: "https://www.cheapshark.com/img/stores/logos/14.png" },
  "16": { uri: "https://www.cheapshark.com/img/stores/logos/15.png" },
  "17": { uri: "https://www.cheapshark.com/img/stores/logos/16.png" },
  "18": { uri: "https://www.cheapshark.com/img/stores/logos/17.png" },
  "19": { uri: "https://www.cheapshark.com/img/stores/logos/18.png" },
  "20": { uri: "https://www.cheapshark.com/img/stores/logos/19.png" },
  "21": { uri: "https://www.cheapshark.com/img/stores/logos/20.png" },
  "22": { uri: "https://www.cheapshark.com/img/stores/logos/21.png" },
  "24": { uri: "https://www.cheapshark.com/img/stores/logos/23.png" },
  "25": { uri: "https://www.cheapshark.com/img/stores/logos/24.png" },
  "26": { uri: "https://www.cheapshark.com/img/stores/logos/25.png" },
  "27": { uri: "https://www.cheapshark.com/img/stores/logos/26.png" },
  "28": { uri: "https://www.cheapshark.com/img/stores/logos/27.png" },
};

const STORE_NAMES: { [key: string]: string } = {
  "1": "Steam",
  "2": "GamersGate",
  "3": "GreenManGaming",
  "4": "Amazon",
  "5": "Newegg",
  "6": "Razer Game Store",
  "7": "GOG",
  "8": "Origin",
  "9": "IndieGameStand",
  "10": "Desura",
  "11": "Humble Store",
  "12": "All Deals",
  "13": "Ubisoft Connect",
  "14": "Direct2Drive",
  "15": "Fanatical",
  "16": "Gamesload",
  "17": "Voidu",
  "18": "GameBillet",
  "19": "Gamesplanet",
  "20": "2Game",
  "21": "GMG",
  "22": "WinGameStore",
  "24": "GamesRocket",
  "25": "Epic Games",
  "26": "Blizzard Shop",
  "27": "Nintendo",
  "28": "Meta Quest",
};

export default function ExploreScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();

  const gameId = (params.id as string) || "3328";
  const gameTitle = (params.title as string) || "Elden Ring";
  const gameImage =
    (params.image as string) ||
    "https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png";
  const gameGenre = (params.genre as string) || "RPG";
  const gameRating = parseFloat((params.rating as string) || "4.8");

  const [deals, setDeals] = useState<CheapSharkDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [gameDetails, setGameDetails] = useState<RawgGameFull | null>(null);
  const [description, setDescription] = useState("");
  const [detailedRating, setDetailedRating] = useState<number>(gameRating);
  const [descriptionLevel, setDescriptionLevel] = useState(0); // 0=200, 1=400, 2=800, 3=full
  const [genres, setGenres] = useState<string[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx > 10 && Math.abs(gestureState.dy) < 80;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          router.push("/main");
        }
      },
    }),
  ).current;

  useEffect(() => {
    loadGameData();
    loadComments();
  }, [gameId, gameTitle]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      setLoading(true);

      if (gameId && gameId !== "3328") {
        const details = await getGameDetails(gameId);
        setGameDetails(details);
        setDescription(details.description_raw || details.description || "");
        if (details.rating) {
          setDetailedRating(details.rating);
        }
        if (details.genres && Array.isArray(details.genres)) {
          setGenres(details.genres.map((g: any) => g.name));
        }
      }

      let results: CheapSharkDeal[] = [];

      const extractSteamAppId = (details: any): string | null => {
        try {
          const stores = details?.stores || [];
          for (const s of stores) {
            const url: string = s?.url || s?.store?.url || "";
            const m = url.match(/store\.steampowered\.com\/app\/(\d+)/i);
            if (m && m[1]) return m[1];
          }
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

      if (!results || results.length === 0) {
        results = await searchDealsByTitle(gameTitle, 60);
      }

      const yearMatch = gameTitle.match(/\((\d{4})\)/);
      if (yearMatch) {
        const year = yearMatch[1];
        const filtered = results.filter((d) =>
          (d.title || "").includes(`(${year})`),
        );
        if (filtered.length > 0) results = filtered;
      }

      const baseTitle = gameTitle
        .replace(/\(\d{4}\)/, "")
        .trim()
        .toLowerCase();
      const normalize = (t: string) =>
        t
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, " ")
          .trim();

      const preferred = results.filter((d) => {
        const dt = normalize(d.title || "");
        const bt = normalize(baseTitle);
        return dt.startsWith(bt);
      });
      if (preferred.length > 0) results = preferred;

      setDeals(results);
    } catch (error) {
      console.error("Error loading game data:", error);
    } finally {
      setLoading(false);
    }
  };

  const dealsByTitle = deals.reduce(
    (acc, deal) => {
      const title = deal.title || gameTitle;
      const storeId = deal.storeID;

      if (!storeId) return acc;

      if (!acc[title]) acc[title] = {};

      const currentPrice = parseFloat(
        deal.salePrice || deal.normalPrice || "999",
      );
      const existingPrice = acc[title][storeId]
        ? parseFloat(
            acc[title][storeId].salePrice ||
              acc[title][storeId].normalPrice ||
              "999",
          )
        : Number.POSITIVE_INFINITY;

      if (!acc[title][storeId] || currentPrice < existingPrice) {
        acc[title][storeId] = deal;
      }
      return acc;
    },
    {} as Record<string, Record<string, CheapSharkDeal>>,
  );

  const sortedTitles = Object.keys(dealsByTitle).sort(
    (a, b) =>
      Object.keys(dealsByTitle[b]).length - Object.keys(dealsByTitle[a]).length,
  );

  React.useEffect(() => {
    const debugPayload = sortedTitles.map((title) => ({
      title,
      stores: Object.values(dealsByTitle[title]).map((deal) => ({
        storeID: deal.storeID,
        storeName: deal.storeID
          ? STORE_NAMES[deal.storeID] || "Unknown"
          : "Unknown",
        salePrice: deal.salePrice,
        normalPrice: deal.normalPrice,
      })),
    }));

    console.log("DEALS_DEBUG", JSON.stringify(debugPayload, null, 2));
  }, [deals]);

  // Load comments from backend
  const loadComments = async () => {
    try {
      const backendComments = await commentService.getByApiId(gameId);
      const formattedComments = backendComments.map((c) =>
        commentService.formatForDisplay(c),
      );
      setComments(formattedComments);

      // Load liked status for each comment
      const likedSet = new Set<string>();
      for (const comment of backendComments) {
        try {
          const hasLiked = await commentService.hasLiked(comment.id);
          if (hasLiked) {
            likedSet.add(comment.id);
          }
        } catch (error) {
          // If error checking like status (e.g., not authenticated), just skip
          console.log(`Could not check like status for comment ${comment.id}`);
        }
      }
      setLikedComments(likedSet);
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    }
  };

  const handleAddComment = async (text: string) => {
    try {
      await commentService.create({
        api_id: gameId,
        game_name: gameTitle,
        content: text,
        is_public: true,
      });
      await loadComments();
      Alert.alert(t("common.success"), t("games.commentAdded"));
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert(t("common.error"), t("games.commentError"));
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const isCurrentlyLiked = likedComments.has(commentId);

      if (isCurrentlyLiked) {
        // Unlike the comment
        await commentService.unlike(commentId);
        setLikedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      } else {
        // Like the comment
        await commentService.like(commentId);
        setLikedComments((prev) => new Set(prev).add(commentId));
      }

      // Reload comments to get updated likes count
      await loadComments();
    } catch (error) {
      console.error("Error toggling like on comment:", error);
      Alert.alert(t("common.error"), t("games.likeError"));
    }
  };

  const getDescriptionText = () => {
    if (!description) return t("games.noDescription");

    const limits = [200, 400, 800];
    if (descriptionLevel < limits.length) {
      const limit = limits[descriptionLevel];
      return description.length > limit
        ? description.substring(0, limit) + "..."
        : description;
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);

  const primaryGenre = genres[0] || gameGenre;

  const refreshWishlistState = useCallback(async () => {
    try {
      const wishlist = await wishlistService.list();
      const found = wishlist.find(
        (item: any) =>
          item.game?.api_id === gameId || item.game_api_id === gameId,
      );
      setIsWishlisted(!!found);
      setWishlistId(found ? String(found.id || found.wishlist_id || "") : null);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      setIsWishlisted(false);
      setWishlistId(null);
    }
  }, [gameId]);

  useEffect(() => {
    refreshWishlistState();
  }, [gameId, refreshWishlistState]);

  useFocusEffect(
    useCallback(() => {
      refreshWishlistState();
    }, [refreshWishlistState]),
  );

  const handleWishlistPress = async () => {
    try {
      setIsWishlistLoading(true);
      console.log("🎮 ========== WISHLIST PROCESS STARTED ==========");
      console.log("📋 Juego:", { gameTitle, gameId, primaryGenre });

      const gamePayload = {
        name: gameTitle,
        api_id: gameId,
        cover_image: gameImage,
        genre: primaryGenre,
        description: description || null,
      };

      console.log("📝 Game Payload:", JSON.stringify(gamePayload, null, 2));

      const gameUrl = `https://rawg.io/games/${gameId}`;

      if (isWishlisted) {
        let targetId = wishlistId;
        if (!targetId) {
          const wishlist = await wishlistService.list();
          const found = wishlist.find(
            (item: any) =>
              item.game?.api_id === gameId || item.game_api_id === gameId,
          );
          targetId = found ? String(found.id || found.wishlist_id || "") : null;
        }

        if (targetId) {
          console.log("🗑️ Eliminando de wishlist, id:", targetId);
          await wishlistService.removeByWishlistId(targetId);
          setIsWishlisted(false);
          setWishlistId(null);
          Alert.alert(
            t("games.removed"),
            t("games.removedFromWishlist").replace("{title}", gameTitle),
          );
        } else {
          console.warn(
            "⚠️ No se encontró wishlistId para eliminar; refrescando estado",
          );
          await refreshWishlistState();
        }
      } else {
        console.log("⏳ Llamando a wishlistService.addByApiId()...");
        const game = await wishlistService.addByApiId(gamePayload, gameUrl);

        console.log("✅ ÉXITO! Guardado en BD:", JSON.stringify(game, null, 2));
        console.log("🎮 ========== WISHLIST PROCESS COMPLETED ==========");

        await refreshWishlistState();
        setIsWishlisted(true);
        Alert.alert(
          t("common.success"),
          t("games.addedToWishlist").replace("{title}", gameTitle),
        );
      }
    } catch (error: any) {
      console.error("❌ ========== ERROR PROCESS ==========");
      console.error("Error message:", error?.message);
      console.error("Error status:", error?.status);
      console.error("Error data:", error?.data);
      console.error("Full error:", JSON.stringify(error, null, 2));
      console.error("❌ ========== END ERROR ==========");

      const errorMessage =
        error?.message || error?.data?.detail || t("games.wishlistError");
      Alert.alert(t("common.error"), errorMessage);
      setIsWishlisted(false);
      setWishlistId(null);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <GradientBackground>
      {/* gestureArea */}
      <View
        {...panResponder.panHandlers}
        className="absolute left-0 top-0 z-[5] h-full w-[50px]"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-[80px] mb-[15px]">
          {/* Header encima de la imagen */}
          <View className="absolute top-0 mt-[-30px] left-0 right-0 z-5">
            <MainHeader />
          </View>

          <View className="items-center">
            <Image
              source={{ uri: gameImage }}
              className="w-[164px] h-[231px] rounded-[4px]"
              resizeMode="cover"
            />
          </View>
        </View>

        <TouchableOpacity
          className={[
            "w-[48px] h-[48px] rounded-full items-center justify-center self-center mt-[15px] mb-[10px] bg-black/60",
            isWishlisted ? "bg-[#FF4D6D]/30" : "",
          ].join(" ")}
          onPress={handleWishlistPress}
          disabled={isWishlistLoading}
          activeOpacity={0.8}
        >
          {isWishlistLoading ? (
            <ActivityIndicator size="small" color="#FF4D6D" />
          ) : (
            <Heart
              size={22}
              color={isWishlisted ? "#FF4D6D" : "#FFFFFF"}
              fill={isWishlisted ? "#FF4D6D" : "none"}
            />
          )}
        </TouchableOpacity>

        <Text className="text-[22px] font-semibold text-white text-center mb-[5px]">
          {gameTitle}
        </Text>

        <View className="items-center mb-[15px]">
          <Text className="text-[#FFD700] text-[14px] font-semibold">
            ★ {detailedRating.toFixed(1)}
          </Text>
        </View>

        {genres.length > 0 && (
          <View className="flex-row flex-wrap justify-center px-[20px] mb-[15px] gap-2">
            {genres.map((genre, index) => (
              <View
                key={index}
                className="rounded-[12px] px-[12px] py-[4px] border bg-[#4A9EFF]/20 border-[#4A9EFF]/40"
              >
                <Text className="text-[#4A9EFF] text-[11px] font-semibold">
                  {genre}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text className="text-[11px] font-bold text-[#B0B0B0] text-left mb-[8px] px-[20px]">
          {t("games.description")}
        </Text>

        <Text className="text-[11px] font-light text-[#E0E0E0] text-left leading-[15px] px-[20px] mb-[4px]">
          {getDescriptionText()}
        </Text>

        {showDescriptionButton && (
          <TouchableOpacity
            onPress={handleDescriptionToggle}
            className="px-[20px] py-[4px] mb-[12px]"
          >
            <Text className="text-[11px] font-semibold text-[#4A9EFF] text-left">
              {descriptionLevel === 3
                ? t("common.viewLess")
                : t("common.viewMore")}
            </Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            style={{ marginVertical: 30 }}
          />
        ) : (
          <>
            {sortedTitles.map((title, sectionIndex) => {
              const storeDeals = Object.values(dealsByTitle[title]).sort(
                (a, b) => {
                  const aPrice = parseFloat(
                    a.salePrice || a.normalPrice || "999",
                  );
                  const bPrice = parseFloat(
                    b.salePrice || b.normalPrice || "999",
                  );
                  return aPrice - bPrice;
                },
              );

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

        <CommentSection
          comments={comments}
          likedComments={likedComments}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
        />

        <View className="h-[40px]" />
      </ScrollView>
    </GradientBackground>
  );
}
