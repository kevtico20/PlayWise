/**
 * Recommendation Service
 * Servicio para obtener recomendaciones de juegos usando IA (Gemini)
 */

import { fetchAPI, fetchAuthAPI } from "./api";
import storageService from "./storageService";

/**
 * Interfaz para una recomendación individual
 */
export interface GameRecommendation {
  name: string;
  genre: string;
  reason: string;
  similarity_score: number;
  id?: number;
  api_id?: string;
  cover_image?: string;
}

/**
 * Interfaz para la respuesta de recomendaciones
 */
export interface RecommendationsResponse {
  success: boolean;
  count: number;
  recommendations: GameRecommendation[];
  user_id: number;
}

/**
 * Interfaz para el historial del usuario
 */
export interface UserHistory {
  liked_games: Array<{
    name: string;
    genre: string;
    rating: number;
  }>;
  wishlist_games: Array<{
    name: string;
    genre: string;
  }>;
  favorite_genres: string[];
}

/**
 * Interfaz para la respuesta del historial
 */
export interface HistoryResponse {
  success: boolean;
  user_id: number;
  history: UserHistory;
}

const recommendationService = {
  /**
   * Obtiene recomendaciones personalizadas para el usuario actual
   * @param count - Número de recomendaciones (1-20, default: 5)
   * @returns Lista de recomendaciones generadas por IA
   */
  getMyRecommendations: async (
    count: number = 5,
  ): Promise<RecommendationsResponse> => {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw new Error("Not authenticated - Token not found");

      const response = await fetchAuthAPI<RecommendationsResponse>(
        `/recommendations/me?count=${count}`,
        token,
        {
          method: "GET",
        },
      );

      return response;
    } catch (error) {
      console.error("Error obteniendo recomendaciones:", error);
      throw error;
    }
  },

  /**
   * Obtiene recomendaciones para un usuario específico
   * @param userId - ID del usuario
   * @param count - Número de recomendaciones (1-20, default: 5)
   * @returns Lista de recomendaciones
   */
  getUserRecommendations: async (
    userId: number,
    count: number = 5,
  ): Promise<RecommendationsResponse> => {
    try {
      const response = await fetchAPI<RecommendationsResponse>(
        `/recommendations/user/${userId}?count=${count}`,
        {
          method: "GET",
        },
      );

      return response;
    } catch (error) {
      console.error(
        `Error obteniendo recomendaciones para usuario ${userId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Obtiene juegos populares (sin personalización)
   * Útil para usuarios nuevos sin historial
   * @param count - Número de juegos (1-50, default: 10)
   * @returns Lista de juegos populares
   */
  getPopularGames: async (
    count: number = 10,
  ): Promise<RecommendationsResponse> => {
    try {
      const response = await fetchAPI<RecommendationsResponse>(
        `/recommendations/popular?count=${count}`,
        {
          method: "GET",
        },
      );

      return response;
    } catch (error) {
      console.error("Error obteniendo juegos populares:", error);
      throw error;
    }
  },

  /**
   * Obtiene el historial analizado del usuario actual
   * Muestra qué datos usa la IA para generar recomendaciones
   * @returns Historial del usuario (juegos calificados, wishlist, géneros favoritos)
   */
  getMyHistory: async (): Promise<HistoryResponse> => {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw new Error("Not authenticated - Token not found");

      const response = await fetchAuthAPI<HistoryResponse>(
        "/recommendations/history/me",
        token,
        {
          method: "GET",
        },
      );

      return response;
    } catch (error) {
      console.error("Error obteniendo historial:", error);
      throw error;
    }
  },
};

export default recommendationService;
