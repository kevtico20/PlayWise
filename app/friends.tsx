import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_COLORS } from "../constants/colors";
import { useTranslation } from "../hooks/use-translation";
import friendsService, {
    FriendRequest,
    UserSummary,
} from "../services/friendsService";
import storageService from "../services/storageService";

// ✅ Enable className support for LinearGradient (expo-linear-gradient)
cssInterop(LinearGradient, {
  className: "style",
});

export default function FriendsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<UserSummary[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [loadingIncoming, setLoadingIncoming] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const currentUserRef = React.useRef<any>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const user = await storageService.getUserData();
      currentUserRef.current = user;
      await loadIncoming();
    })();
  }, []);

  async function loadIncoming() {
    try {
      setLoadingIncoming(true);
      const items = await friendsService.listIncomingRequests();
      setIncoming(items || []);
    } catch (err) {
      console.warn("Error loading incoming friend requests", err);
    } finally {
      setLoadingIncoming(false);
    }
  }

  async function performSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length === 0) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      // call the service (it may return contains matches); we enforce contains filter locally
      const users = await friendsService.searchUsers(trimmed);
      const matches = users
        .filter((u) => String(u.id) !== String(currentUserRef.current?.id))
        .filter((u) =>
          String(u.username || "")
            .toLowerCase()
            .includes(trimmed.toLowerCase()),
        );

      // Show all matches returned by the service (no local truncation).
      setResults(matches);
    } catch (err) {
      console.warn("Search users error", err);
    } finally {
      setSearching(false);
    }
  }

  // Public handler used by submit button / enter key
  async function handleSearch() {
    Keyboard.dismiss();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    await performSearch(query);
  }

  // Called on each text change, debounced
  function handleQueryChange(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Debounce 300ms
    debounceRef.current = setTimeout(() => {
      performSearch(text);
      debounceRef.current = null;
    }, 300);
  }

  async function handleSendRequest(userId: number) {
    try {
      setActionLoading(true);
      await friendsService.sendFriendRequest(userId);
      // Optionally refresh incoming for recipient; for sender we can show confirmation
      // Remove user from results
      setResults((prev) => prev.filter((r) => r.id !== userId));
    } catch (err: any) {
      console.warn("Error sending friend request", err);
      // Could show Alert
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendByUsername(username: string) {
    try {
      setActionLoading(true);
      await friendsService.sendFriendRequestByUsername(username);
      // Clear query and results
      setQuery("");
      setResults([]);
    } catch (err) {
      console.warn("Error sending friend request by username", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRespond(requestId: number, accept: boolean) {
    try {
      setActionLoading(true);
      await friendsService.respondRequest(requestId, accept);
      // Refresh incoming list
      await loadIncoming();
    } catch (err) {
      console.warn("Error responding friend request", err);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={[APP_COLORS.gradientTop, APP_COLORS.gradientBottom]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-white font-semibold">{t("friends.title")}</Text>

          <View className="w-[28]" />
        </View>

        <View className="px-4 pt-3">
          {/* Search box */}
          <View className="flex-row items-center mb-3">
            <TextInput
              value={query}
              onChangeText={handleQueryChange}
              placeholder={
                t("friends.searchPlaceholder") || "Buscar usuario..."
              }
              placeholderTextColor="#C0C0C0"
              className="flex-1 bg-[#222] text-white px-3 py-2 rounded-l-md"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              onPress={handleSearch}
              className="bg-[#4A9EFF] px-3 py-2 rounded-r-md"
            >
              {searching ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Ionicons name="search" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Search results */}
          {results.length > 0 && (
            <View className="mb-4">
              <Text className="text-white font-semibold mb-2">Resultados</Text>
              <FlatList
                data={results}
                keyExtractor={(i) => String(i.id)}
                renderItem={({ item }) => (
                  <View className="flex-row items-center justify-between bg-[#111] p-3 rounded-md mb-2">
                    <Text className="text-white">{item.username}</Text>
                    <TouchableOpacity
                      onPress={() => handleSendRequest(item.id)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-[#4A9EFF] rounded-md"
                    >
                      <Text className="text-white">Enviar solicitud</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          {/* If no results, allow sending request by username (fallback) */}
          {!searching && results.length === 0 && query.trim() !== "" && (
            <View className="mb-4">
              <Text className="text-white font-semibold mb-2">Enviar a</Text>
              <View className="flex-row items-center justify-between bg-[#111] p-3 rounded-md mb-2">
                <Text className="text-white">{query.trim()}</Text>
                <TouchableOpacity
                  onPress={() => handleSendByUsername(query.trim())}
                  disabled={actionLoading}
                  className="px-3 py-1 bg-[#4A9EFF] rounded-md"
                >
                  {actionLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text className="text-white">Enviar solicitud</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Incoming requests */}
          <Text className="text-white font-semibold mb-2">Solicitudes</Text>
          {loadingIncoming ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : incoming.length === 0 ? (
            <Text className="text-white/70">No hay solicitudes</Text>
          ) : (
            <FlatList
              data={incoming}
              keyExtractor={(i) => String(i.id)}
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between bg-[#111] p-3 rounded-md mb-2">
                  <View>
                    <Text className="text-white font-semibold">
                      {item.from_user.username}
                    </Text>
                    <Text className="text-white/60 text-[12px]">
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => handleRespond(item.id, true)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-[#22c55e] rounded-md mr-2"
                    >
                      <Text className="text-white">Aceptar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRespond(item.id, false)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-[#ef4444] rounded-md"
                    >
                      <Text className="text-white">Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
