import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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
import { Letter } from "../../app/types";
import { useAuth } from "../../src/context/AuthContext";
import { letterAPI } from "../../src/utils/api";

export default function InboxScreen() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchLetters();
      }
    }, [token]),
  );

  const fetchLetters = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await letterAPI.getInbox(token);

      if (response.success) {
        setLetters(response.letters);
      } else {
        Alert.alert("Error", response.error || "Failed to fetch inbox");
      }
    } catch (err) {
      console.error("Fetch inbox error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLetters();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (letterId: string) => {
    if (!token) return;

    try {
      await letterAPI.markAsRead(token, letterId);
      setLetters((prev) =>
        prev.map((l) => (l.id === letterId ? { ...l, read: true } : l)),
      );
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const renderLetter = ({ item }: { item: Letter }) => {
    const isUnread = !item.read;
    const deliveredDate = new Date(item.delivered_at);
    const now = new Date();
    const isDelivered = deliveredDate <= now;

    return (
      <TouchableOpacity
        style={[styles.letterCard, isUnread && styles.letterCardUnread]}
        onPress={() => handleMarkAsRead(item.id)}
      >
        {/* Unread Indicator */}
        {isUnread && <View style={styles.unreadDot} />}

        {/* Header */}
        <View style={styles.letterHeader}>
          <View style={styles.senderInfo}>
            <View style={styles.senderAvatar}>
              <Text style={styles.avatarText}>
                {item.username.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.senderDetails}>
              <Text style={styles.senderName}>{item.username}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="#4f46e5" />
                <Text style={styles.location}>
                  {item.city}, {item.country}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Badge */}
          {isDelivered ? (
            <View style={styles.deliveredBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.deliveredText}>Delivered</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Ionicons name="time" size={16} color="#f59e0b" />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>

        {/* Content Preview */}
        <View style={styles.contentPreview}>
          <Text
            style={styles.contentText}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {item.content}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.letterFooter}>
          <Text style={styles.dateText}>
            {deliveredDate.toLocaleDateString()} at{" "}
            {deliveredDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isUnread && <Text style={styles.newBadge}>NEW</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="#4f46e5" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("../(main)/ProfileScreen")}
          >
            <Ionicons name="person-circle" size={32} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Letters List */}
      <FlatList
        data={letters}
        keyExtractor={(item) => item.id}
        renderItem={renderLetter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="mail" size={48} color="#4f46e5" />
            <Text style={styles.emptyText}>No letters yet</Text>
            <Text style={styles.emptySubtext}>Check back soon!</Text>
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerRight: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },

  // Letter Card
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  letterCard: {
    backgroundColor: "#1a1a2e",
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#374151",
    position: "relative",
  },
  letterCardUnread: {
    borderColor: "#4f46e5",
    backgroundColor: "#1a1a2e",
  },
  unreadDot: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4f46e5",
  },

  // Header
  letterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  senderInfo: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  location: {
    color: "#9ca3af",
    fontSize: 11,
  },

  // Status Badge
  deliveredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 6,
  },
  deliveredText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "600",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 6,
  },
  pendingText: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "600",
  },

  // Content Preview
  contentPreview: {
    marginVertical: 10,
  },
  contentText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
  },

  // Footer
  letterFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 10,
  },
  dateText: {
    color: "#6b7280",
    fontSize: 11,
  },
  newBadge: {
    color: "#4f46e5",
    fontSize: 10,
    fontWeight: "bold",
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
    fontSize: 14,
    marginTop: 6,
  },
});
