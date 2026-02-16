import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Badge, Text } from "react-native-paper";
import { letterAPI } from "../../app/utils/api";
import { useAuth } from "../../components/hooks/useAuth";

const COLORS = {
  primary: "#007AFF",
  bg: "#F8F9FC",
  white: "#FFFFFF",
  text: "#1C1C1E",
  gray: "#8E8E93",
  accent: "#E5F1FF",
  success: "#34C759",
};

export default function HomeScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [inbox, setInbox] = useState<any[]>([]);
  const [outbox, setOutbox] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = async () => {
    setRefreshing(true);
    try {
      const [iData, oData] = await Promise.all([
        letterAPI.getInbox(token),
        letterAPI.getOutbox(token),
      ]);
      if (iData.success) setInbox(iData.letters.slice(0, 5)); // Son 5 mektup
      if (oData.success) setOutbox(oData.letters);
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const onWayLetters = outbox.filter(
    (l) => new Date(l.delivered_at) > new Date(),
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeSub}>Tekrar Hoş Geldin,</Text>
          <Text style={styles.welcomeMain}>
            {user?.username || "Gezgin"}! 👋
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push("/(main)/ProfileScreen")}
        >
          <Avatar.Text
            size={45}
            label={user?.username?.[0].toUpperCase() || "G"}
            style={styles.avatarCircle}
            labelStyle={{ fontSize: 20, fontWeight: "700" }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadHomeData}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Yoldaki Mektuplar - Yatay Kartlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚚 Yoldaki Mektupların</Text>
          {onWayLetters.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.onWayScroll}
            >
              {onWayLetters.map((letter) => (
                <View key={letter.id} style={styles.onWayCard}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="airplane"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.onWayUser}>{letter.username}</Text>
                  <Text style={styles.onWayTime}>
                    {Math.max(
                      0,
                      Math.round(
                        (new Date(letter.delivered_at).getTime() -
                          new Date().getTime()) /
                          60000,
                      ),
                    )}{" "}
                    dk kaldı
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Şu an yolda mektubun yok.</Text>
            </View>
          )}
        </View>

        {/* Son Gelenler Listesi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📩 Son Gelenler</Text>
            <TouchableOpacity
              onPress={() => router.push("/(main)/InboxScreen")}
            >
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {inbox.length > 0 ? (
            <View style={styles.inboxList}>
              {inbox.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.letterItem}
                  onPress={() => router.push(`/(main)/InboxScreen`)}
                >
                  <View style={styles.letterLeft}>
                    <Avatar.Text
                      size={48}
                      label={item.username?.[0] || "?"}
                      style={styles.listAvatar}
                    />
                    <View style={styles.letterInfo}>
                      <Text style={styles.letterUser}>{item.username}</Text>
                      <Text numberOfLines={1} style={styles.letterSnippet}>
                        {item.content}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.letterRight}>
                    {!item.read && (
                      <Badge size={10} style={styles.unreadBadge} />
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={COLORS.gray}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Henüz mektup almadın.</Text>
            </View>
          )}
        </View>

        {/* Aksiyon Butonu */}
        <View style={styles.footerAction}>
          <TouchableOpacity
            style={styles.mainActionBtn}
            onPress={() => router.push("/(main)/DiscoverScreen")}
          >
            <Ionicons name="search" size={20} color={COLORS.white} />
            <Text style={styles.mainActionText}>Yeni Birini Bul</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 25,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 4,
    shadowOpacity: 0.05,
  },
  welcomeSub: { fontSize: 14, color: COLORS.gray, fontWeight: "500" },
  welcomeMain: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },
  profileBtn: { elevation: 2 },
  avatarCircle: { backgroundColor: COLORS.accent },

  section: { marginTop: 25 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginLeft: 25,
    marginBottom: 15,
  },
  seeAllText: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },

  onWayScroll: { paddingLeft: 25 },
  onWayCard: {
    backgroundColor: COLORS.white,
    width: 140,
    padding: 15,
    borderRadius: 24,
    marginRight: 15,
    alignItems: "center",
    elevation: 2,
    shadowOpacity: 0.05,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  onWayUser: { color: COLORS.text, fontWeight: "700", fontSize: 14 },
  onWayTime: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  inboxList: {
    backgroundColor: COLORS.white,
    marginHorizontal: 25,
    borderRadius: 24,
    paddingVertical: 10,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  letterItem: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  letterLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  listAvatar: { backgroundColor: COLORS.bg, marginRight: 15 },
  letterInfo: { flex: 1 },
  letterUser: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  letterSnippet: { color: COLORS.gray, fontSize: 13, marginTop: 2 },
  letterRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  unreadBadge: { backgroundColor: COLORS.primary },

  emptyBox: {
    marginHorizontal: 25,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  emptyText: { color: COLORS.gray, fontStyle: "italic", fontSize: 13 },

  footerAction: { padding: 40, alignItems: "center" },
  mainActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 20,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  mainActionText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
});
