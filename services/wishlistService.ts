import { fetchAPI, fetchAuthAPI } from "./api";
import storageService from "./storageService";

export interface WishListCreate {
  api_id: string; // Usar api_id en lugar de game_id para evitar problemas con integers grandes
  url?: string | null;
}

export interface GameRead {
  id: number;
  name: string;
  genre?: string | null;
  api_id?: string | null;
  description?: string | null;
  cover_image?: string | null;
  release_date?: string | null;
  platforms?: string | null;
  developer?: string | null;
  publisher?: string | null;
}

export interface GameCreate {
  name: string;
  genre?: string | null;
  api_id?: string | null;
  description?: string | null;
  cover_image?: string | null;
  release_date?: string | null;
  platforms?: string | null;
  developer?: string | null;
  publisher?: string | null;
}

class WishlistService {
  /**
   * Crear un registro de juego directamente en la BD
   * POST /games con los datos del juego
   */
  async createGameRecord(payload: GameCreate): Promise<GameRead> {
    console.log("🎮 Creando registro de juego:", payload);
    const token = await storageService.getAccessToken();
    if (!token) throw new Error("Not authenticated - Token not found");

    try {
      const created = await fetchAuthAPI<GameRead>(`/games`, token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("✅ Juego creado en BD:", created);
      return created;
    } catch (err: any) {
      console.error("❌ Error creando juego:", err);
      throw new Error(
        `No se pudo crear el juego: ${err?.message || "Error desconocido"}`,
      );
    }
  }

  /**
   * Obtener un juego existente por api_id
   */
  async getGameByApiId(apiId: string): Promise<GameRead> {
    console.log("🔍 Buscando juego por api_id:", apiId);
    try {
      const existing = await fetchAPI<GameRead>(
        `/games/by-api-id/${encodeURIComponent(apiId)}`,
        {
          method: "GET",
        },
        [404], // 404 es esperado, no loguear como error
      );
      console.log("✅ Juego encontrado:", existing);
      return existing;
    } catch (err: any) {
      if (err?.status === 404) {
        // 404 es esperado cuando el juego no existe aún
        throw new Error("Game not found");
      }
      console.error("❌ Error buscando juego:", err);
      throw new Error(
        `Error buscando juego: ${err?.message || "Error desconocido"}`,
      );
    }
  }

  /**
   * Resolve an existing game by api_id or create it if missing.
   * Intenta obtener, si no existe lo crea
   */
  async ensureGameRecord(payload: GameCreate): Promise<GameRead> {
    const apiId = (payload.api_id || "").trim();
    if (!apiId) throw new Error("Missing api_id to ensure game record");

    try {
      const existing = await this.getGameByApiId(apiId);
      console.log("✅ Juego ya existe en BD, reutilizando");
      return existing;
    } catch (err: any) {
      if (err?.message === "Game not found") {
        console.log("🆕 Juego no existe, creando nuevo registro...");
        return await this.createGameRecord(payload);
      }
      throw err;
    }
  }

  /**
   * Add a wishlist entry for the current user, using api_id instead of game_id.
   * POST /wishlists con auth
   */
  async addToWishlist(apiId: string, url?: string | null): Promise<any> {
    console.log("❤️ Agregando a wishlist. API ID:", apiId);

    const token = await storageService.getAccessToken();
    console.log("🔑 Token disponible:", !!token);

    if (!token) throw new Error("Not authenticated - Token not found");

    const body: WishListCreate = { api_id: apiId, url: url || null };

    console.log("📤 POST /wishlists con body:", body);
    try {
      const result = await fetchAuthAPI<any>(`/wishlists/`, token, {
        method: "POST",
        body: JSON.stringify(body),
      });
      console.log("✅ Agregado a wishlist:", result);
      return result;
    } catch (err: any) {
      if (err?.status === 401) {
        throw new Error("No autorizado. Por favor inicia sesión nuevamente.");
      }
      if (
        err?.status === 400 &&
        err?.data?.detail?.includes("already in wishlist")
      ) {
        throw new Error("Este juego ya está en tu wishlist.");
      }
      console.error("❌ Error agregando a wishlist:", err);
      throw new Error(
        err?.data?.detail || err?.message || "Error al guardar en wishlist",
      );
    }
  }

  /**
   * Convenience: Ensure game by api_id, then add to wishlist.
   * Paso 1: Crear/obtener juego
   * Paso 2: Agregar a wishlist usando api_id
   * Paso 3: Verificar guardado
   */
  async addByApiId(
    payload: GameCreate,
    url?: string | null,
  ): Promise<GameRead> {
    console.log("🚀 Iniciando proceso addByApiId...");
    console.log("📝 Payload del juego:", payload);

    try {
      // Paso 1: Asegurar que el juego existe en BD
      console.log("PASO 1: Asegurando registro de juego...");
      const game = await this.ensureGameRecord(payload);
      console.log("✅ PASO 1 completado. Game api_id:", game.api_id);

      // Paso 2: Agregar a wishlist usando api_id
      console.log("PASO 2: Agregando a wishlist con api_id...");
      await this.addToWishlist(game.api_id!, url);
      console.log("✅ PASO 2 completado - Juego agregado exitosamente");

      // Paso 3: Verificar que se guardó (opcional, completamente silencioso)
      // Simplemente retornamos el juego - ya se guardó exitosamente en PASO 2
      return game;
    } catch (err: any) {
      console.error("❌ Error en addByApiId:", err);
      throw err;
    }
  }

  /**
   * Get current user's wishlist entries (with game info if backend supports it).
   * Retorna array vacío silenciosamente si el usuario no está autenticado.
   */
  async list(): Promise<any[]> {
    const token = await storageService.getAccessToken();
    console.log(
      "🔑 Token para wishlist:",
      token ? `${token.substring(0, 20)}...` : "NO TOKEN",
    );

    if (!token) {
      console.warn("⚠️ No hay token - usuario no autenticado");
      return [];
    }

    try {
      const res = await fetchAuthAPI<any[]>(
        `/wishlists/`, // IMPORTANTE: usar trailing slash para evitar 307 redirect
        token,
        {
          method: "GET",
        },
        [401], // Suprimir logs de error 401 (no autenticado)
      );
      console.log(`✅ Wishlist obtenida del servidor:`, res);
      return Array.isArray(res) ? res : [];
    } catch (err: any) {
      // Si es error 401, simplemente retornar vacío (usuario no autenticado)
      if (err?.status === 401) {
        console.warn("⚠️ Error 401: Token inválido o expirado");
        return [];
      }
      console.warn("⚠️ Error cargando wishlist:", err?.message || err);
      return [];
    }
  }

  /**
   * Check if current user has wishlisted a game by api_id.
   * Tries to resolve the game id first, then queries wishlists by game_id.
   */
  async isWishlistedByApiId(apiId: string): Promise<boolean> {
    try {
      const game = await this.getGameByApiId(apiId);

      const token = await storageService.getAccessToken();
      if (!token) return false;

      // Assuming backend supports filtering by game_id via query param
      const list = await fetchAuthAPI<any[]>(
        `/wishlists?game_id=${encodeURIComponent(String(game.id))}`,
        token,
        {
          method: "GET",
        },
      );
      return Array.isArray(list) ? list.length > 0 : false;
    } catch (err: any) {
      if (err?.status === 404) return false;
      return false;
    }
  }

  /**
   * Remove from wishlist by wishlist_id
   * Usa directamente el ID del item en la tabla wishlist
   */
  async removeByWishlistId(wishlistId: string): Promise<void> {
    // Backend nos devuelve el id como string para evitar pérdida de precisión
    console.log("🗑️ Eliminando de wishlist - wishlist_id:", wishlistId);
    const token = await storageService.getAccessToken();
    if (!token) throw new Error("Not authenticated - Token not found");

    try {
      // Usar directamente el wishlist_id para eliminar
      await fetchAuthAPI<void>(`/wishlists/${wishlistId}`, token, {
        method: "DELETE",
      });

      console.log("✅ Eliminado de wishlist exitosamente");
    } catch (err: any) {
      console.error("❌ Error eliminando de wishlist:", err);
      throw new Error(err?.message || "Error al eliminar de wishlist");
    }
  }

  /**
   * Obtener juegos en común en wishlist entre el usuario actual y otro usuario
   */
  async getCommonGames(friendUserId: string): Promise<any[]> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) return [];

      const res = await fetchAuthAPI<any[]>(
        `/wishlists/common/${encodeURIComponent(friendUserId)}`,
        token,
        {
          method: "GET",
        },
      );
      return Array.isArray(res) ? res : [];
    } catch (err: any) {
      console.warn("⚠️ Error obteniendo juegos en común:", err?.message || err);
      return [];
    }
  }
}

export default new WishlistService();
