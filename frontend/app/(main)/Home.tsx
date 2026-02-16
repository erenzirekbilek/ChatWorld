import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Avatar,
  Badge,
  Card,
  Divider,
  IconButton,
  Text,
} from "react-native-paper";
import { letterAPI } from "../../app/utils/api"; // Yolun doğruluğundan emin ol
import { useAuth } from "../../components/hooks/useAuth"; // Yolun doğruluğundan emin ol

export default function HomeScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [inbox, setInbox] = useState<any[]>([]);
  const [outbox, setOutbox] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = async () => {
    setRefreshing(true);
    try {
      const [sData, iData, oData] = await Promise.all([
        letterAPI.getStatistics(token),
        letterAPI.getInbox(token),
        letterAPI.getOutbox(token),
      ]);
      if (sData.success) setStats(sData.statistics);
      if (iData.success) setInbox(iData.letters.slice(0, 3));
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={loadHomeData}
          tintColor="#4f46e5"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>
          Selam, {user?.username || "Gezgin"}! 👋
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats?.total_stamps || 0}</Text>
            <Text style={styles.statLabel}>Pul</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats?.friends_count || 0}</Text>
            <Text style={styles.statLabel}>Arkadaş</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>🚚 Yoldaki Mektupların</Text>
      {onWayLetters.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.onWayScroll}
        >
          {onWayLetters.map((letter) => (
            <Card key={letter.id} style={styles.onWayCard}>
              <Card.Content>
                <Text style={styles.onWayUser}>Alıcı: {letter.username}</Text>
                <Text style={styles.onWayTime}>
                  Kalan:{" "}
                  {Math.max(
                    0,
                    Math.round(
                      (new Date(letter.delivered_at).getTime() -
                        new Date().getTime()) /
                        60000,
                    ),
                  )}{" "}
                  dk
                </Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>Şu an yolda mektubun yok.</Text>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📩 Son Gelenler</Text>
        <TouchableOpacity onPress={() => router.push("/(main)/InboxScreen")}>
          <Text style={styles.seeAll}>Hepsini Gör</Text>
        </TouchableOpacity>
      </View>

      {inbox.length > 0 ? (
        inbox.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.push(`/(main)/InboxScreen`)}
          >
            <View style={styles.letterItem}>
              <Avatar.Text
                size={40}
                label={item.username?.[0] || "?"}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.letterUser}>{item.username}</Text>
                <Text numberOfLines={1} style={styles.letterSnippet}>
                  {item.content}
                </Text>
              </View>
              {!item.read && <Badge size={8} style={styles.badge} />}
            </View>
            <Divider style={styles.divider} />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyText}>Henüz mektup almadın.</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push("/(main)/DiscoverScreen")}
        >
          <IconButton icon="magnify" iconColor="#fff" size={24} />
          <Text style={styles.actionText}>Yeni Birini Bul</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1e" },
  header: {
    padding: 25,
    paddingTop: 50,
    backgroundColor: "#16213e",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcome: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-around",
  },
  statBox: { alignItems: "center" },
  statNum: { color: "#4f46e5", fontSize: 22, fontWeight: "bold" },
  statLabel: { color: "#aaa", fontSize: 12 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", margin: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
  },
  seeAll: { color: "#4f46e5" },
  onWayScroll: { paddingLeft: 20 },
  onWayCard: {
    backgroundColor: "#1a1a2e",
    width: 160,
    marginRight: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
  },
  onWayUser: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  onWayTime: { color: "#aaa", fontSize: 10, marginTop: 5 },
  letterItem: { flexDirection: "row", padding: 15, alignItems: "center" },
  avatar: { backgroundColor: "#4f46e5", marginRight: 15 },
  letterUser: { color: "#fff", fontWeight: "bold" },
  letterSnippet: { color: "#aaa", fontSize: 13 },
  badge: { backgroundColor: "#4f46e5", alignSelf: "center" },
  divider: { backgroundColor: "#222", marginHorizontal: 20 },
  emptyText: {
    color: "#555",
    marginLeft: 20,
    marginBottom: 10,
    fontStyle: "italic",
  },
  actions: { padding: 30, alignItems: "center" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f46e5",
    borderRadius: 15,
    paddingRight: 20,
  },
  actionText: { color: "#fff", fontWeight: "bold" },
});
