import { fetchAuthAPI } from "./api";
import storageService from "./storageService";

export interface UserSummary {
  id: string;
  username: string;
  profile_picture?: string | null;
  friendship_status?: string | null; // null, 'pending', 'accepted', 'sent_pending'
}

export interface FriendRequest {
  id: string;
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
        `/users/search/?search=${encodeURIComponent(query)}`,
        token,
        { method: "GET" },
        [404, 405], // suppress logging 404/405 for search (treat as empty result)
      );

      return resp || [];
    } catch (err) {
      throw err;
    }
  }

  async sendFriendRequest(targetUserId: string): Promise<FriendRequest> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };

      // New backend contract: POST /friends/request
      const resp = await fetchAuthAPI<FriendRequest>(
        "/friends/request",
        token,
        {
          method: "POST",
          body: JSON.stringify({ receiver_id: targetUserId }),
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

  async getFriends(): Promise<any[]> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };

      const resp = await fetchAuthAPI<any[]>("/friends/", token, {
        method: "GET",
      });
      return resp || [];
    } catch (err) {
      throw err;
    }
  }

  async listIncomingRequests(): Promise<FriendRequest[]> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };
      // Backend contract: GET /friends/pending returns pending friend requests
      const resp = await fetchAuthAPI<{
        received: FriendRequest[];
        sent: FriendRequest[];
      }>("/friends/pending", token, { method: "GET" });
      // Return only received requests (incoming)
      return resp?.received || [];
    } catch (err) {
      // Propagate auth errors (401) or unexpected errors to be handled by caller/UI
      throw err;
    }
  }

  async respondRequest(requestId: string, accept: boolean): Promise<any> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };

      // New backend contract: PUT /friends/request/{request_id}
      const endpoint = `/friends/request/${encodeURIComponent(requestId)}`;

      const resp = await fetchAuthAPI(endpoint, token, {
        method: "PUT",
        body: JSON.stringify({ status: accept ? "accepted" : "rejected" }),
      });

      return resp;
    } catch (err) {
      throw err;
    }
  }

  async removeFriend(friendUserId: string): Promise<void> {
    try {
      const token = await storageService.getAccessToken();
      if (!token) throw { status: 401, message: "Not authenticated" };

      const endpoint = `/friends/${encodeURIComponent(friendUserId)}`;

      await fetchAuthAPI(endpoint, token, {
        method: "DELETE",
      });
    } catch (err) {
      throw err;
    }
  }
}

export default new FriendsService();
