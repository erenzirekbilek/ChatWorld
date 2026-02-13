import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import { letterAPI } from "../../src/utils/api";

const GENDERS = ["All", "Male", "Female", "Other"];
const COUNTRIES = [
  "All",
  "Turkey",
  "USA",
  "Germany",
  "France",
  "Japan",
  "Other",
];

export default function DiscoverScreen() {
  const [users, setUsers] = useState<any[]>([]); // Tip eklendi
  const [loading, setLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");

  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      discoverUsers();
    }
  }, [token]);

  const discoverUsers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const filters: any = {}; // Tip eklendi
      if (selectedGender !== "All") filters.gender = selectedGender;
      if (selectedCountry !== "All") filters.country = selectedCountry;
      if (searchUsername.trim()) filters.username = searchUsername;

      const response = await letterAPI.discover(token, filters);
      if (response.success) {
        setUsers(response.users);
      } else {
        Alert.alert("Hata", response.error || "Kullanıcılar keşfedilemedi");
      }
    } catch (err) {
      console.error("Discover error:", err);
      Alert.alert("Hata", "Kullanıcı listesi alınırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [token, selectedGender, selectedCountry, searchUsername]);

  // ÇÖZÜM: Parametrelere açıkça tip (string) veya 'any' verildi
  const handleSendLetter = (receiverId: any, receiverUsername: any) => {
    router.push({
      pathname: "/SendLetterModal" as any,
      params: { receiverId, receiverUsername },
    });
  };

  // ÇÖZÜM: 'item' için tip belirlemesi yapıldı
  const renderUserCard = ({ item }: { item: any }) => {
    return (
      <View style={styles.userCard}>
        {/* Avatar Bölümü */}
        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Text style={styles.avatarImage}>👤</Text>
          ) : (
            <Text style={styles.avatarPlaceholder}>
              {item.username ? item.username.charAt(0).toUpperCase() : "?"}
            </Text>
          )}
        </View>

        {/* Kullanıcı Bilgileri */}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#4f46e5" />
            <Text style={styles.location}>
              {item.city}, {item.country}
            </Text>
          </View>
          <View style={styles.genderRow}>
            <Ionicons
              name={
                item.gender === "Male"
                  ? "male"
                  : item.gender === "Female"
                    ? "female"
                    : "person"
              }
              size={14}
              color="#4f46e5"
            />
            <Text style={styles.gender}>{item.gender}</Text>
          </View>

          {item.bio && <Text style={styles.bio}>{item.bio}</Text>}

          {item.interests && (
            <View style={styles.interestsContainer}>
              {item.interests
                .split(",")
                .map((interest: string, idx: number) => (
                  <View key={idx} style={styles.interestBadge}>
                    <Text style={styles.interestText}>{interest.trim()}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* Buton Bölümü */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSendLetter(item.id, item.username)}
        >
          <Ionicons name="mail" size={20} color="#fff" />
          <Text style={styles.sendButtonText}>Mektup Gönder</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keşfet</Text>
        <TouchableOpacity onPress={() => router.push("/ProfileScreen" as any)}>
          <Ionicons name="person-circle" size={32} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Arama Kutusu */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı adı ara..."
          placeholderTextColor="#888"
          value={searchUsername}
          onChangeText={setSearchUsername}
        />
        <TouchableOpacity onPress={discoverUsers}>
          <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Filtreleme Alanı */}
      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Cinsiyet:</Text>
          <View style={styles.filterButtonsRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.filterButton,
                  selectedGender === g && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedGender(g)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedGender === g && styles.filterButtonTextActive,
                  ]}
                >
                  {g === "All" ? "Hepsi" : g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Ülke:</Text>
          <View style={styles.filterButtonsRow}>
            {COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.filterButton,
                  selectedCountry === c && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedCountry(c)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCountry === c && styles.filterButtonTextActive,
                  ]}
                >
                  {c === "All" ? "Hepsi" : c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Kullanıcı Listesi */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserCard}
        onRefresh={discoverUsers}
        refreshing={loading}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#4f46e5" />
            <Text style={styles.emptyText}>
              {loading ? "Keşfediliyor..." : "Kullanıcı bulunamadı"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1e" },
  header: {
    backgroundColor: "#16213e",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16213e",
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4f46e5",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  filterSection: {
    backgroundColor: "#16213e",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  filterRow: { marginBottom: 10 },
  filterLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  filterButtonsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  filterButton: {
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#374151",
  },
  filterButtonActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  filterButtonText: { color: "#9ca3af", fontSize: 11, fontWeight: "500" },
  filterButtonTextActive: { color: "#fff" },
  userCard: {
    backgroundColor: "#1a1a2e",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#374151",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarImage: { fontSize: 28 },
  avatarPlaceholder: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  userInfo: { marginBottom: 12 },
  username: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 6 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  location: { color: "#9ca3af", fontSize: 13, marginLeft: 6 },
  genderRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  gender: { color: "#9ca3af", fontSize: 13, marginLeft: 6 },
  bio: {
    color: "#cbd5e1",
    fontSize: 13,
    marginVertical: 8,
    fontStyle: "italic",
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
  interestText: { color: "#fff", fontSize: 11 },
  sendButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: { color: "#888", fontSize: 16, marginTop: 12 },
});
