import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { Stamp, Statistics } from "../../app/types";
import { letterAPI } from "../../app/utils/api";
import { useAuth } from "../../src/context/AuthContext";

const COLORS = {
  primary: "#007AFF",
  bg: "#F8F9FC",
  white: "#FFFFFF",
  text: "#1C1C1E",
  gray: "#8E8E93",
  accent: "#E5F1FF",
  danger: "#FF3B30",
};

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) loadProfileData();
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Ayrılmak istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/LoginScreen");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profilim</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.roundBtn}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* User Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
            <TouchableOpacity
              style={styles.editBadge}
              onPress={() => router.push("/(main)/EditProfileScreen" as any)}
            >
              <Ionicons name="pencil" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.locationTag}>
            <Ionicons name="location" size={14} color={COLORS.primary} />
            <Text style={styles.locationText}>
              {user?.city}, {user?.country}
            </Text>
          </View>

          {user?.bio && <Text style={styles.bio}>"{user.bio}"</Text>}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats?.sent_count || 0}</Text>
            <Text style={styles.statLab}>Gönderilen</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statVal}>{stats?.received_count || 0}</Text>
            <Text style={styles.statLab}>Alınan</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats?.friends_count || 0}</Text>
            <Text style={styles.statLab}>Arkadaş</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İlgi Alanlarım</Text>
          <View style={styles.interestsWrapper}>
            {user?.interests?.split(",").map((item, idx) => (
              <View key={idx} style={styles.interestChip}>
                <Text style={styles.interestChipText}>{item.trim()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stamps Collection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pul Koleksiyonu</Text>
            <Text style={styles.stampCountTotal}>{stamps.length} Pul</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.stampsScroll}
          >
            {stamps.length > 0 ? (
              stamps.map((stamp, idx) => (
                <View key={idx} style={styles.stampCard}>
                  <View style={styles.stampIconBg}>
                    <Text style={{ fontSize: 30 }}>
                      {stamp.stamp_type === "vintage" ? "🎫" : "📮"}
                    </Text>
                  </View>
                  <Text style={styles.stampName}>{stamp.stamp_type}</Text>
                  <Text style={styles.stampQty}>x{stamp.count}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyStamps}>
                Henüz pulun yok. Mektup yazarak kazanabilirsin!
              </Text>
            )}
          </ScrollView>
        </View>

        {/* Navigation Actions */}
        <View style={styles.menuContainer}>
          <MenuBtn
            icon="mail-outline"
            label="Gelen Kutusu"
            onPress={() => router.push("/(main)/InboxScreen")}
          />
          <MenuBtn
            icon="people-outline"
            label="Arkadaşlarım"
            onPress={() => router.push("../FriendsScreen")}
          />
          <MenuBtn
            icon="search-outline"
            label="Yeni İnsanlar Bul"
            onPress={() => router.push("/(main)/DiscoverScreen")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Yardımcı Bileşen
const MenuBtn = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.menuBtn} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.menuText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
  },

  profileSection: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingBottom: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 2,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: { fontSize: 40, fontWeight: "bold", color: COLORS.primary },
  editBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderSize: 3,
    borderColor: COLORS.white,
  },
  username: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  email: { color: COLORS.gray, fontSize: 14, marginTop: 2 },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  bio: {
    paddingHorizontal: 40,
    textAlign: "center",
    marginTop: 15,
    color: COLORS.text,
    fontStyle: "italic",
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 20,
    elevation: 4,
    shadowOpacity: 0.1,
    height: 80,
    alignItems: "center",
  },
  statBox: { flex: 1, alignItems: "center" },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#F0F0F0",
  },
  statVal: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  statLab: { fontSize: 11, color: COLORS.gray, marginTop: 2 },

  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  stampCountTotal: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },

  interestsWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  interestChipText: { fontSize: 13, color: COLORS.text, fontWeight: "500" },

  stampsScroll: { marginLeft: -20, paddingLeft: 20 },
  stampCard: {
    width: 100,
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 20,
    marginRight: 15,
    alignItems: "center",
    elevation: 2,
  },
  stampIconBg: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  stampName: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.text,
    textTransform: "capitalize",
  },
  stampQty: { fontSize: 11, color: COLORS.primary, marginTop: 4 },
  emptyStamps: { color: COLORS.gray, fontStyle: "italic" },

  menuContainer: { marginTop: 30, paddingHorizontal: 20, gap: 10 },
  menuBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 18,
    elevation: 1,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { fontSize: 15, fontWeight: "600", color: COLORS.text },
});
