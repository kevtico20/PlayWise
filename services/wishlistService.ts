import { fetchAPI, fetchAuthAPI } from './api';
import storageService from './storageService';

export interface WishListCreate {
  game_id: number;
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
   * Resolve an existing game by api_id or create it if missing.
   * This assumes backend supports:
   *  - GET /games/by-api-id/{api_id}
   *  - POST /games (GameCreate)
   */
  async ensureGameRecord(payload: GameCreate): Promise<GameRead> {
    const apiId = (payload.api_id || '').trim();
    if (!apiId) throw new Error('Missing api_id to ensure game record');

    try {
      const existing = await fetchAPI<GameRead>(`/games/by-api-id/${encodeURIComponent(apiId)}`, {
        method: 'GET',
      });
      return existing;
    } catch (err: any) {
      if (err && err.status === 404) {
        // Create the game
        const created = await fetchAPI<GameRead>(`/games`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return created;
      }
      throw err;
    }
  }

  /**
   * Add a wishlist entry for the current user, given a DB game id.
   */
  async addToWishlist(gameId: number, url?: string | null): Promise<void> {
    const token = await storageService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const body: WishListCreate = { game_id: gameId, url: url || null };
    await fetchAuthAPI(`/wishlists`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Convenience: Ensure game by api_id, then add to wishlist.
   */
  async addByApiId(payload: GameCreate, url?: string | null): Promise<GameRead> {
    const game = await this.ensureGameRecord(payload);
    await this.addToWishlist(game.id, url);
    return game;
  }

  /**
   * Get current user's wishlist entries (with game info if backend supports it).
   */
  async list(): Promise<any[]> {
    const token = await storageService.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetchAuthAPI<any[]>(`/wishlists`, token, { method: 'GET' });
    return Array.isArray(res) ? res : [];
  }

  /**
   * Check if current user has wishlisted a game by api_id.
   * Tries to resolve the game id first, then queries wishlists by game_id.
   */
  async isWishlistedByApiId(apiId: string): Promise<boolean> {
    try {
      const game = await fetchAPI<GameRead>(`/games/by-api-id/${encodeURIComponent(apiId)}`, {
        method: 'GET',
      });

      const token = await storageService.getAccessToken();
      if (!token) return false;

      // Assuming backend supports filtering by game_id via query param
      const list = await fetchAuthAPI<any[]>(`/wishlists?game_id=${encodeURIComponent(String(game.id))}`, token, {
        method: 'GET',
      });
      return Array.isArray(list) ? list.length > 0 : false;
    } catch (err: any) {
      if (err && err.status === 404) return false;
      return false;
    }
  }
}

export default new WishlistService();
