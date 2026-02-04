import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_COLORS } from "../constants/colors";
import { useTranslation } from "../hooks/use-translation";
import storageService from "../services/storageService";
import wishlistService from "../services/wishlistService";

// Componente para cada item de la wishlist
function WishlistItem({
  item,
  onDelete,
  t,
}: {
  item: any;
  onDelete: () => void;
  t: any;
}) {
  const cover = item.game_cover_image || null;
  const name = item.game_name || t("common.unknown");
  const genre = item.game_genre || "";
  const description = item.game_description || "";
  const developer = item.game_developer || null;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 border-b border-white/10 gap-4"
    >
      {/* Información del juego (izquierda) */}
      <View className="flex-1">
        <Text
          className="text-white text-[20px] font-semibold mb-1"
          numberOfLines={2}
        >
          {name}
        </Text>

        {!!genre && (
          <Text className="text-white/70 text-[15px] mb-2" numberOfLines={1}>
            {genre}
          </Text>
        )}

        {!!developer && (
          <Text className="text-white/60 text-[13px] mb-2" numberOfLines={1}>
            {developer}
          </Text>
        )}

        {!!description && (
          <Text className="text-white/50 text-[13px]" numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {/* Imagen (derecha) */}
      {cover ? (
        <Image
          source={{ uri: cover }}
          className="w-[80] h-[110] rounded-[6]"
          resizeMode="cover"
        />
      ) : (
        <View className="w-[80] h-[110] rounded-[6] bg-white/20 items-center justify-center">
          <Ionicons name="image-outline" size={40} color="#FFFFFF/50" />
        </View>
      )}
    </TouchableOpacity>
  );
}

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
        console.log("🎮 Wishlist items:", JSON.stringify(list, null, 2));
        if (mounted) setItems(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("❌ Error:", error);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <LinearGradient
      colors={[APP_COLORS.gradientTop, APP_COLORS.gradientBottom]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-white text-[20px] font-semibold">
            {t("games.wishlist")}
          </Text>

          <View className="w-[28]" />
        </View>

        {/* Content */}
        <View className="flex-1 w-full">
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : items.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-white/50 text-[16px]">
                {t("games.wishlist")} vacía
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <WishlistItem
                  item={item}
                  t={t}
                  onDelete={async () => {
                    try {
                      await wishlistService.removeByWishlistId(String(item.id));
                      setItems(items.filter((i) => i.id !== item.id));
                    } catch (error) {
                      console.error("❌ Error eliminando:", error);
                    }
                  }}
                />
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
