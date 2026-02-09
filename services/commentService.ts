import { api } from "./api";

export interface Comment {
  id: string; // Changed from number to string for large IDs
  user_id: string; // Changed from number to string
  game_id: string; // Changed from number to string
  content: string;
  is_public: boolean;
  is_edited: boolean;
  parent_comment_id?: string | null; // Changed from number to string
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentWithUser extends Comment {
  username: string;
  user_profile_picture?: string | null;
}

export interface CommentWithReplies extends CommentWithUser {
  replies: CommentWithUser[];
}

export interface CreateCommentData {
  api_id?: string; // RAWG game ID
  game_id?: number; // Internal DB game ID (can still send as number)
  game_name?: string; // Game name for auto-creation
  content: string;
  is_public?: boolean;
  parent_comment_id?: string | null; // Changed to string for large IDs
}

export interface UpdateCommentData {
  content?: string;
  is_public?: boolean;
}

class CommentService {
  /**
   * Create a new comment or reply
   */
  async create(data: CreateCommentData): Promise<Comment> {
    const response = await api.post<Comment>("/comments/", data);
    return response.data;
  }

  /**
   * Get all comments for a specific game
   */
  async getByGame(
    gameId: number,
    skip: number = 0,
    limit: number = 50,
  ): Promise<CommentWithUser[]> {
    const response = await api.get<CommentWithUser[]>(
      `/comments/game/${gameId}`,
      {
        params: { skip, limit },
      },
    );
    return response.data;
  }

  /**
   * Get all comments for a specific game by its RAWG API ID
   */
  async getByApiId(
    apiId: string,
    skip: number = 0,
    limit: number = 50,
  ): Promise<CommentWithUser[]> {
    const response = await api.get<CommentWithUser[]>(
      `/comments/api/${apiId}`,
      {
        params: { skip, limit },
      },
    );
    return response.data;
  }

  /**
   * Get a specific comment with all its replies
   */
  async getWithReplies(commentId: string): Promise<CommentWithReplies> {
    const response = await api.get<CommentWithReplies>(
      `/comments/${commentId}`,
    );
    return response.data;
  }

  /**
   * Get all comments by a specific user
   */
  async getByUser(
    userId: string, // Changed to string for large IDs
    skip: number = 0,
    limit: number = 50,
  ): Promise<CommentWithUser[]> {
    const response = await api.get<CommentWithUser[]>(
      `/comments/user/${userId}`,
      {
        params: { skip, limit },
      },
    );
    return response.data;
  }

  /**
   * Update a comment
   */
  async update(commentId: string, data: UpdateCommentData): Promise<Comment> {
    const response = await api.put<Comment>(`/comments/${commentId}`, data);
    return response.data;
  }

  /**
   * Delete a comment (and all its replies)
   */
  async delete(commentId: string): Promise<void> {
    await api.delete<void>(`/comments/${commentId}`);
  }

  /**
   * Like a comment
   */
  async like(commentId: string): Promise<Comment> {
    const response = await api.post<Comment>(`/comments/${commentId}/like`);
    return response.data;
  }

  /**
   * Unlike a comment
   */
  async unlike(commentId: string): Promise<Comment> {
    const response = await api.post<Comment>(`/comments/${commentId}/unlike`);
    return response.data;
  }

  /**
   * Check if the current user has liked a comment
   */
  async hasLiked(commentId: string): Promise<boolean> {
    const response = await api.get<{ has_liked: boolean }>(
      `/comments/${commentId}/has-liked`,
    );
    return response.data.has_liked;
  }

  /**
   * Format comment for display (convert backend format to UI format)
   */
  formatForDisplay(comment: CommentWithUser): {
    id: string;
    userName: string;
    avatar?: string;
    text: string;
    likes: number;
    timeAgo: string;
    isEdited?: boolean;
  } {
    return {
      id: comment.id, // Already a string from backend
      userName: comment.username,
      avatar: comment.user_profile_picture || undefined,
      text: comment.content,
      likes: comment.likes_count,
      timeAgo: this.getTimeAgo(comment.created_at),
      isEdited: comment.is_edited,
    };
  }

  /**
   * Calculate time ago from timestamp
   */
  private getTimeAgo(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
    return `${Math.floor(seconds / 31536000)}y ago`;
  }
}

const commentService = new CommentService();
export default commentService;
