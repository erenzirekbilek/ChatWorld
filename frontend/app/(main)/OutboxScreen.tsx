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

export default function OutboxScreen() {
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
      const response = await letterAPI.getOutbox(token);

      if (response.success) {
        setLetters(response.letters);
      } else {
        Alert.alert("Error", response.error || "Failed to fetch outbox");
      }
    } catch (err) {
      console.error("Fetch outbox error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLetters();
    setRefreshing(false);
  };

  const renderLetter = ({ item }: { item: Letter }) => {
    const deliveredDate = new Date(item.delivered_at);
    const now = new Date();
    const isDelivered = deliveredDate <= now;
    const isRead = item.read;

    return (
      <View style={styles.letterCard}>
        {/* Header */}
        <View style={styles.letterHeader}>
          <View style={styles.receiverInfo}>
            <View style={styles.receiverAvatar}>
              <Text style={styles.avatarText}>
                {item.username.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.receiverDetails}>
              <Text style={styles.receiverName}>{item.username}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="#4f46e5" />
                <Text style={styles.location}>
                  {item.city}, {item.country}
                </Text>
              </View>
            </View>
          </View>

          {/* Status */}
          {isDelivered ? (
            <View style={styles.statusColumn}>
              <View
                style={[
                  styles.statusBadge,
                  isRead ? styles.readBadge : styles.deliveredBadge,
                ]}
              >
                <Ionicons
                  name={isRead ? "checkmark-done" : "checkmark-circle"}
                  size={14}
                  color={isRead ? "#10b981" : "#f59e0b"}
                />
                <Text
                  style={[
                    styles.statusText,
                    isRead ? styles.readText : styles.deliveredText,
                  ]}
                >
                  {isRead ? "Read" : "Delivered"}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.statusColumn}>
              <View style={styles.pendingBadge}>
                <Ionicons name="time" size={14} color="#f59e0b" />
                <Text style={styles.pendingText}>Sending...</Text>
              </View>
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
            {new Date(item.created_at).toLocaleDateString()} at{" "}
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isDelivered && (
            <Text style={styles.deliveryTimeText}>
              Delivered:{" "}
              {deliveredDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sent</Text>
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
            <Ionicons name="send" size={48} color="#4f46e5" />
            <Text style={styles.emptyText}>No letters sent</Text>
            <Text style={styles.emptySubtext}>Start discovering users!</Text>
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
  },

  // Header
  letterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  receiverInfo: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  receiverAvatar: {
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
  receiverDetails: {
    flex: 1,
  },
  receiverName: {
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

  // Status
  statusColumn: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deliveredBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  readBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deliveredText: {
    color: "#f59e0b",
  },
  readText: {
    color: "#10b981",
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
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 10,
  },
  dateText: {
    color: "#6b7280",
    fontSize: 11,
    marginBottom: 4,
  },
  deliveryTimeText: {
    color: "#10b981",
    fontSize: 11,
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
