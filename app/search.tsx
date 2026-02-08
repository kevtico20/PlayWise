import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    View
} from "react-native";
import GradientBackground from "../components/GradientBackground";
import GameCard from "../components/main/GameCard";
import { RawgGameShort, searchGames } from "../services/rawgService";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RawgGameShort[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const debounceRef = useRef<any>(null);

  useEffect(() => {
    // Debounce queries to avoid spamming API
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length === 0) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    // reset page on new query
    setPage(1);
    setHasMore(false);

    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await searchGames(query, 1, 20);
        const items = resp.results || [];
        setResults(items);
        // RAWG returns `next` when there's a next page
        setHasMore(!!(resp as any).next);
      } catch (e: any) {
        console.warn("Search error:", e);
        setError(e?.message || "Error buscando juegos. Verifica tu conexión.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const renderItem = ({ item }: { item: RawgGameShort }) => (
    <GameCard
      id={String(item.id)}
      image={item.background_image || ""}
      title={item.name}
      genre={item.genres && item.genres.length ? item.genres[0].name : ""}
    />
  );

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const resp = await searchGames(query, nextPage, 20);
      const items = resp.results || [];
      // Append and dedupe by id
      setResults((prev) => {
        const map = new Map(prev.map((i) => [String(i.id), i]));
        for (const it of items) {
          map.set(String(it.id), it);
        }
        return Array.from(map.values());
      });
      setPage(nextPage);
      setHasMore(!!(resp as any).next);
    } catch (e) {
      console.warn("Error loading more search results", e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <GradientBackground>
      <View className="px-4 pt-12">
        <View className="mb-3">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar juegos..."
            placeholderTextColor="#C0C0C0"
            className="bg-[#222] text-white px-3 py-2 rounded-md"
            autoFocus
          />
        </View>

        {loading && (
          <View className="items-center mt-4">
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        )}

        {error && (
          <View className="items-center mt-4">
            <Text className="text-red-400">{error}</Text>
          </View>
        )}

        {!loading && !error && results.length === 0 && query.trim() !== "" && (
          <View className="items-center mt-4">
            <Text className="text-white">No se encontraron juegos</Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          horizontal={false}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          onEndReached={() => {
            // automatic load more when reaching list end
            if (hasMore && !loadingMore && !loading && query.trim() !== "") {
              loadMore();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            <View className="items-center mt-3 mb-6">
              {loadingMore ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : null}
            </View>
          )}
        />
      </View>
    </GradientBackground>
  );
}
