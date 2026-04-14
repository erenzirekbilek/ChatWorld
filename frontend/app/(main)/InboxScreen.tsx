import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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
import { Letter } from "../../app/types";
import { letterAPI } from "../../app/utils/api";
import { useAuth } from "../../src/context/AuthContext";

const COLORS = {
  primary: "#007AFF",
  bg: "#F8F9FC",
  white: "#FFFFFF",
  text: "#1C1C1E",
  gray: "#8E8E93",
  accent: "#E5F1FF",
  success: "#34C759",
  warning: "#FF9500",
  border: "#F2F2F7",
};

export default function InboxScreen() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (token) fetchLetters();
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
        Alert.alert("Hata", response.error || "Gelen kutusu yüklenemedi");
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const renderLetter = ({ item }: { item: Letter }) => {
    const isUnread = !item.read;
    const deliveredDate = new Date(item.delivered_at);

    return (
      <TouchableOpacity
        style={[styles.letterCard, isUnread && styles.unreadCardShadow]}
        onPress={() => handleMarkAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.senderSection}>
            <Avatar.Text
              size={44}
              label={item.username?.charAt(0).toUpperCase()}
              style={styles.avatarStyle}
              labelStyle={{
                fontSize: 18,
                fontWeight: "700",
                color: COLORS.primary,
              }}
            />
            <View style={styles.senderTextContainer}>
              <Text style={styles.senderName}>{item.username}</Text>
              <View style={styles.locRow}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={COLORS.gray}
                />
                <Text style={styles.locText}>
                  {item.city}, {item.country}
                </Text>
              </View>
            </View>
          </View>
          {isUnread && <View style={styles.unreadIndicator} />}
        </View>

        <Text style={styles.previewText} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={12} color={COLORS.gray} />
            <Text style={styles.dateText}>
              {deliveredDate.toLocaleDateString("tr-TR")} •{" "}
              {deliveredDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleSection}>
          <Text style={styles.headerTitle}>Gelen Kutusu</Text>
          <Text style={styles.headerSub}>
            {letters.filter((l) => !l.read).length > 0
              ? `${letters.filter((l) => !l.read).length} yeni mektup`
              : "Tüm mektuplar okundu"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/(main)/ProfileScreen")}
        >
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={letters}
        keyExtractor={(item) => item.id}
        renderItem={renderLetter}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons
                name="mail-open-outline"
                size={40}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>Kutun Boş</Text>
            <Text style={styles.emptyDesc}>
              Henüz kimse mektup göndermemiş. İlk adımı sen at!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 3,
    shadowOpacity: 0.05,
  },
  headerTitleSection: { flex: 1 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: COLORS.text },
  headerSub: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  listPadding: { padding: 20, paddingBottom: 40 },
  letterCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  unreadCardShadow: {
    borderColor: COLORS.accent,
    borderWidth: 1,
    shadowOpacity: 0.08,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  senderSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarStyle: { backgroundColor: COLORS.accent },
  senderTextContainer: { gap: 2 },
  senderName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locText: { fontSize: 12, color: COLORS.gray },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  previewText: {
    fontSize: 14,
    color: "#48484A",
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.bg,
  },
  timeContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 11, color: COLORS.gray, fontWeight: "500" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 20,
  },
});
