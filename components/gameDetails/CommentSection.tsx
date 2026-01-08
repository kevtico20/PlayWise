import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Comment {
  id: string;
  userName: string;
  avatar?: string;
  text: string;
  likes: number;
  timeAgo: string;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment?: (text: string) => void;
  onLikeComment?: (commentId: string) => void;
}

export default function CommentSection({ comments, onAddComment, onLikeComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment('');
      Keyboard.dismiss();
    }
  };

  const renderComment = (item: Comment) => (
    <View key={item.id} style={styles.commentItem}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{item.userName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timeAgo}>{item.timeAgo}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => onLikeComment?.(item.id)}
          >
            <Ionicons name="thumbs-up-outline" size={14} color="#FFFFFF" />
            <Text style={styles.likeCount}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.replyButton}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a Comment"
          placeholderTextColor="#999999"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <View style={styles.inputActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="happy-outline" size={20} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments List */}
      <View style={styles.commentsListContainer}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <View style={styles.commentsList}>
          {comments.map(renderComment)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    fontSize: 14,
    color: '#333333',
    minHeight: 40,
    marginBottom: 8,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  submitButton: {
    marginLeft: 'auto',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  commentsListContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 16,
    minHeight: 300,
  },
  commentsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  commentsList: {
    // Removed flex: 1 since we're not using FlatList anymore
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  timeAgo: {
    color: '#999999',
    fontSize: 12,
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  replyButton: {
    color: '#999999',
    fontSize: 12,
  },
});
