// app/(main)/FriendsScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "react-native-paper";
import { Friend } from "../../app/types";
import { friendshipAPI } from "../../app/utils/api";
import { useAuth } from "../../src/context/AuthContext";

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchFriends();
      }
    }, [token]),
  );

  const fetchFriends = async () => {
    if (!token) return;

    try {
      setRefreshing(true);
      const response = await friendshipAPI.getFriends(token);

      if (response.success) {
        setFriends(response.friends || []);
      } else {
        Alert.alert("Error", response.error || "Failed to fetch friends");
      }
    } catch (err) {
      console.error("Fetch friends error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  };

  const handleSendLetter = (friendId: string, friendName: string) => {
    router.push({
      pathname: "/(main)/SendLetterModal",
      params: { receiverId: friendId, receiverUsername: friendName },
    });
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color="#4f46e5" />
          <Text style={styles.location}>
            {item.city}, {item.country}
          </Text>
        </View>
        {item.bio && (
          <Text numberOfLines={1} style={styles.bio}>
            {item.bio}
          </Text>
        )}
      </View>

      {/* Send Letter Button */}
      <TouchableOpacity
        style={styles.sendBtn}
        onPress={() => handleSendLetter(item.friend_id, item.username)}
      >
        <Ionicons name="send" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4f46e5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends ({friends.length})</Text>
        <TouchableOpacity onPress={() => router.push("../ProfileScreen")}>
          <Ionicons name="person-circle" size={32} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Friends List */}
      <FlatList
        data={friends}
        keyExtractor={(item) => item.friend_id}
        renderItem={renderFriend}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={48} color="#4f46e5" />
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>
              Discover users and send friend requests!
            </Text>
            <TouchableOpacity
              style={styles.discoverButton}
              onPress={() => router.push("/(main)/DiscoverScreen")}
            >
              <Text style={styles.discoverButtonText}>Find Friends</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  header: {
    backgroundColor: "#16213e",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },

  // Friend Card
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  friendCard: {
    backgroundColor: "#1a1a2e",
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#374151",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  location: {
    color: "#9ca3af",
    fontSize: 11,
  },
  bio: {
    color: "#cbd5e1",
    fontSize: 11,
    fontStyle: "italic",
  },
  sendBtn: {
    backgroundColor: "#4f46e5",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySubtext: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 20,
  },
  discoverButton: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  discoverButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
