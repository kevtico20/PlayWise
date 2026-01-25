import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function CommentSection({
  comments,
  onAddComment,
  onLikeComment,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment("");
      Keyboard.dismiss();
    }
  };

  const renderComment = (item: Comment) => (
    <View key={item.id} className="flex-row mb-3">
      {/* Avatar */}
      <View className="mr-3">
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            className="w-[36] h-[36] rounded-full"
          />
        ) : (
          <View className="w-[36] h-[36] rounded-full bg-[#4A90E2] items-center justify-center">
            <Text className="text-white text-[16px] font-semibold">
              {item.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center mb-[2]">
          <Text className="text-white text-[14px] font-semibold mr-2">
            {item.userName}
          </Text>
          <Text className="text-[#999999] text-[12px]">{item.timeAgo}</Text>
        </View>

        <Text className="text-white text-[14px] leading-[2] mb-4 ">
          {item.text}
        </Text>

        <View className="flex-row items-center">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => onLikeComment?.(item.id)}
          >
            <Ionicons name="thumbs-up-outline" size={14} color="#FFFFFF" />
            <Text className="text-white text-[12px] ml-1">{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="ml-4">
            <Text className="text-[#999999] text-[12px]">Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="mt-5 px-5">
      {/* Input Box */}
      <View className="bg-white rounded-[8] p-3 mb-4">
        <TextInput
          className="text-[14px] text-[#333333] min-h-[40] mb-2"
          placeholder="Add a Comment"
          placeholderTextColor="#999999"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />

        <View className="flex-row items-center">
          <TouchableOpacity className="p-1">
            <Ionicons name="happy-outline" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity
            className="ml-auto bg-[#2196F3] px-4 py-[6] rounded-[4]"
            onPress={handleSubmit}
          >
            <Text className="text-white text-[13px] font-semibold">Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments List */}
      <View className="bg-black/50 rounded-[12] p-3 min-h-[300]">
        <Text className="text-white text-[18px] font-semibold mb-3">
          Comments
        </Text>

        <View>{comments.map(renderComment)}</View>
      </View>
    </View>
  );
}
