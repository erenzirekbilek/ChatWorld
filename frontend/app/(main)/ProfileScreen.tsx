// app/(main)/ProfileScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "react-native-paper";
import { Stamp, Statistics } from "../../app/types";
import { letterAPI } from "../../app/utils/api";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadProfileData();
    }
  }, [token]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [statsRes, stampsRes] = await Promise.all([
        letterAPI.getStatistics(token!),
        letterAPI.getStamps(token!),
      ]);

      if (statsRes.success) setStats(statsRes.statistics);
      if (stampsRes.success) setStamps(stampsRes.stamps || []);
    } catch (error) {
      console.error("Load profile data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/LoginScreen");
        },
      },
    ]);
  };

  const stampEmojis: Record<string, string> = {
    vintage: "🎫",
    modern: "📮",
    rare: "⭐",
    classic: "🏛️",
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#ff6b6b" />
        </TouchableOpacity>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>
            {user?.username?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#4f46e5" />
            <Text style={styles.location}>
              {user?.city}, {user?.country}
            </Text>
          </View>

          {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

          {user?.interests && (
            <View style={styles.interestsContainer}>
              {user.interests
                .split(",")
                .map((interest: string, idx: number) => (
                  <View key={idx} style={styles.interestBadge}>
                    <Text style={styles.interestText}>{interest.trim()}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            router.push({
              pathname: "/(main)/EditProfileScreen" as any,
            });
          }}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.sent_count || 0}</Text>
            <Text style={styles.statLabel}>Sent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.received_count || 0}</Text>
            <Text style={styles.statLabel}>Received</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.read_count || 0}</Text>
            <Text style={styles.statLabel}>Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.friends_count || 0}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>
      </View>

      {/* Stamps Collection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎫 Stamp Collection</Text>
        {stamps.length > 0 ? (
          <View style={styles.stampsContainer}>
            {stamps.map((stamp: Stamp, idx: number) => (
              <View key={idx} style={styles.stampCard}>
                <Text style={styles.stampEmoji}>
                  {stampEmojis[stamp.stamp_type] || "🎫"}
                </Text>
                <Text style={styles.stampType}>{stamp.stamp_type}</Text>
                <Text style={styles.stampCount}>×{stamp.count}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Send letters to collect stamps!</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(main)/DiscoverScreen")}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Discover Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(main)/InboxScreen")}
        >
          <Ionicons name="mail" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>My Inbox</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("../FriendsScreen")}
        >
          <Ionicons name="people" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>My Friends</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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

  // User Card
  userCard: {
    backgroundColor: "#1a1a2e",
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#374151",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    marginBottom: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  location: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  bio: {
    color: "#cbd5e1",
    fontSize: 13,
    fontStyle: "italic",
    marginVertical: 8,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  interestBadge: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  interestText: {
    color: "#fff",
    fontSize: 11,
  },
  editButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#4f46e5",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Section
  section: {
    marginHorizontal: 15,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  statItem: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    padding: 12,
    width: "48%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },

  // Stamps
  stampsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stampCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: "22%",
    borderWidth: 1,
    borderColor: "#374151",
  },
  stampEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  stampType: {
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
  },
  stampCount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4f46e5",
    marginTop: 4,
  },

  // Actions
  actionButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Empty
  emptyText: {
    color: "#6b7280",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 20,
  },
});
