import { fetchAuthAPI } from "./api";
import storageService from "./storageService";

export interface UserSummary {
  id: number;
  username: string;
  profile_picture?: string | null;
}

export interface FriendRequest {
  id: number;
  from_user: UserSummary;
  to_user: UserSummary;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

class FriendsService {
  async searchUsers(query: string): Promise<UserSummary[]> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };

      const resp = await fetchAuthAPI<UserSummary[]>(
        `/users?search=${encodeURIComponent(query)}`,
        token,
        { method: "GET" },
        [404, 405], // suppress logging 404/405 for search (treat as empty result)
      );

      return resp || [];
    } catch (err) {
      throw err;
    }
  }

  async sendFriendRequest(targetUserId: number): Promise<FriendRequest> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };

      // New backend contract: POST /friends/request
      const resp = await fetchAuthAPI<FriendRequest>(
        "/friends/request",
        token,
        {
          method: "POST",
          body: JSON.stringify({ to_user_id: targetUserId }),
        },
      );

      return resp;
    } catch (err) {
      throw err;
    }
  }

  async sendFriendRequestByUsername(username: string): Promise<FriendRequest> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };

      const resp = await fetchAuthAPI<FriendRequest>(
        "/friends/request",
        token,
        {
          method: "POST",
          body: JSON.stringify({ username }),
        },
      );

      return resp;
    } catch (err) {
      throw err;
    }
  }

  async listIncomingRequests(): Promise<FriendRequest[]> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };
      // Backend contract: GET /friends/pending returns pending friend requests
      const resp = await fetchAuthAPI<FriendRequest[]>(
        "/friends/pending",
        token,
        { method: "GET" },
      );
      return resp || [];
    } catch (err) {
      // Propagate auth errors (401) or unexpected errors to be handled by caller/UI
      throw err;
    }
  }

  async respondRequest(requestId: number, accept: boolean): Promise<any> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };

      // New backend contract: PUT /friends/request/{request_id}
      const endpoint = `/friends/request/${encodeURIComponent(String(requestId))}`;

      const resp = await fetchAuthAPI(endpoint, token, {
        method: "PUT",
        body: JSON.stringify({ accept: accept }),
      });

      return resp;
    } catch (err) {
      throw err;
    }
  }
}

export default new FriendsService();
