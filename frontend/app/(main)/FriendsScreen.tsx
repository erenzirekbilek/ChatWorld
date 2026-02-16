import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Text } from "react-native-paper";
import { Friend } from "../../app/types";
import { friendshipAPI } from "../../app/utils/api";
import { useAuth } from "../../src/context/AuthContext";

const COLORS = {
  primary: "#007AFF",
  bg: "#F8F9FC",
  white: "#FFFFFF",
  text: "#1C1C1E",
  gray: "#8E8E93",
  accent: "#E5F1FF",
  border: "#F2F2F7",
};

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
        Alert.alert("Hata", response.error || "Arkadaşlar yüklenemedi");
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
      <Avatar.Text
        size={50}
        label={item.username.charAt(0).toUpperCase()}
        style={styles.avatarStyle}
        labelStyle={{ color: COLORS.primary, fontWeight: "700" }}
      />

      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={COLORS.gray} />
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

      <TouchableOpacity
        style={styles.sendBtn}
        onPress={() => handleSendLetter(item.friend_id, item.username)}
        activeOpacity={0.7}
      >
        <Ionicons name="mail-outline" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Arkadaşlarım</Text>
          <Text style={styles.headerSubText}>{friends.length} Kişi</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push("/(main)/ProfileScreen")}
        >
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      {/* Friends List */}
      <FlatList
        data={friends}
        keyExtractor={(item) => item.friend_id}
        renderItem={renderFriend}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="people-outline"
                size={40}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.emptyText}>Henüz dostun yok</Text>
            <Text style={styles.emptySubtext}>
              Dünyanın her yerinden insanlarla tanışmak için keşfetmeye başla.
            </Text>
            <TouchableOpacity
              style={styles.discoverButton}
              onPress={() => router.push("/(main)/DiscoverScreen")}
            >
              <Text style={styles.discoverButtonText}>Arkadaş Bul</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  headerSubText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
  },

  // Friend Card
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  friendCard: {
    backgroundColor: COLORS.white,
    marginBottom: 15,
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  avatarStyle: {
    backgroundColor: COLORS.accent,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 15,
  },
  friendName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  location: {
    color: COLORS.gray,
    fontSize: 12,
  },
  bio: {
    color: COLORS.gray,
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.8,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  emptySubtext: {
    color: COLORS.gray,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },
  discoverButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  discoverButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
