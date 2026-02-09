/**
 * AI Recommendations Section Component
 * Muestra recomendaciones personalizadas generadas por IA (Gemini)
 */

import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import recommendationService, {
    GameRecommendation,
} from "../../services/recommendationService";

interface RecommendationsSectionProps {
  wishlistGameIds?: string[];
}

export default function RecommendationsSection({
  wishlistGameIds = [],
}: RecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar obtener recomendaciones personalizadas
      const response = await recommendationService.getMyRecommendations(5);

      setRecommendations(response.recommendations);
    } catch (err: any) {
      console.error("Error cargando recomendaciones:", err);

      // Fallback: cargar juegos populares si falla
      try {
        const fallbackResponse = await recommendationService.getPopularGames(5);
        setRecommendations(fallbackResponse.recommendations);
      } catch (fallbackErr) {
        setError("No se pudieron cargar las recomendaciones");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGamePress = (game: GameRecommendation) => {
    // Navegar a detalles del juego
    if (game.api_id) {
      router.push({
        pathname: "/(tabs)/explore",
        params: {
          id: game.api_id,
          title: game.name,
          image: game.cover_image || "",
          genre: game.genre || "Varios",
        },
      });
    }
  };

  if (loading) {
    return (
      <View className="mb-6 px-[14]">
        <View className="flex-row items-center mb-3">
          <Sparkles size={20} color="#FFD700" fill="#FFD700" />
          <Text className="text-white text-[20px] font-semibold ml-2">
            Recomendaciones IA
          </Text>
        </View>
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#FFD700" />
          <Text className="text-gray-400 mt-2">
            Generando recomendaciones...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mb-6 px-[14]">
        <View className="flex-row items-center mb-3">
          <Sparkles size={20} color="#FFD700" fill="#FFD700" />
          <Text className="text-white text-[20px] font-semibold ml-2">
            Recomendaciones IA
          </Text>
        </View>
        <View className="bg-red-900/20 p-4 rounded-lg">
          <Text className="text-red-400">{error}</Text>
          <TouchableOpacity
            onPress={loadRecommendations}
            className="mt-2 bg-red-700 py-2 px-4 rounded"
          >
            <Text className="text-white text-center">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      {/* Header con icono de IA */}
      <View className="flex-row items-center justify-between px-[14] mb-3">
        <View className="flex-row items-center">
          <Sparkles size={20} color="#FFD700" fill="#FFD700" />
          <Text className="text-white text-[20px] font-semibold ml-2">
            Recomendaciones IA
          </Text>
        </View>
        <TouchableOpacity onPress={loadRecommendations}>
          <Text className="text-[#FFD700] text-[14px]">Actualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable games */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14 }}
      >
        {recommendations.map((game, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleGamePress(game)}
            className="mr-3"
            style={{ width: 160 }}
          >
            {/* Game Image */}
            <View className="relative">
              <Image
                source={{
                  uri:
                    game.cover_image ||
                    "https://via.placeholder.com/160x200?text=No+Image",
                }}
                className="w-full h-[200px] rounded-lg"
                resizeMode="cover"
              />

              {/* AI Badge */}
              <View className="absolute top-2 right-2 bg-yellow-500/90 px-2 py-1 rounded-full flex-row items-center">
                <Sparkles size={12} color="#000" fill="#000" />
                <Text className="text-black text-[10px] font-bold ml-1">
                  IA
                </Text>
              </View>

              {/* Similarity Score */}
              <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded">
                <Text className="text-yellow-400 text-[12px] font-semibold">
                  {game.similarity_score}% match
                </Text>
              </View>
            </View>

            {/* Game Info */}
            <View className="mt-2">
              <Text
                className="text-white font-semibold text-[14px]"
                numberOfLines={1}
              >
                {game.name}
              </Text>
              <Text className="text-gray-400 text-[12px]" numberOfLines={1}>
                {game.genre}
              </Text>

              {/* AI Reason */}
              {game.reason && (
                <View className="mt-1 bg-gray-800/50 p-2 rounded">
                  <Text className="text-gray-300 text-[11px]" numberOfLines={3}>
                    {game.reason}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
