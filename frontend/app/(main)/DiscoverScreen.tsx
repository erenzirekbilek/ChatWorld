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
import { profileAPI } from "../../app/utils/api";
import { useAuth } from "../../src/context/AuthContext";

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

interface User {
  id: string;
  username: string;
  bio?: string;
  gender: string;
  country: string;
  city: string;
  avatar_url?: string;
  interests?: string;
}

export default function DiscoverScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const { token } = useAuth();
  const router = useRouter();

  // İlk yüklemede tüm kullanıcıları getir
  useEffect(() => {
    if (token) {
      discoverUsers();
    }
  }, [token]);

  // Filtreleri değiştirince otomatik olarak ara
  useEffect(() => {
    if (token) {
      discoverUsers();
    }
  }, [selectedGender, selectedCountry]);

  const discoverUsers = useCallback(async () => {
    if (!token) {
      Alert.alert("Hata", "Token bulunamadı. Lütfen giriş yapınız.");
      return;
    }

    try {
      setLoading(true);

      const filters: any = {};
      if (selectedGender !== "All") filters.gender = selectedGender;
      if (selectedCountry !== "All") filters.country = selectedCountry;
      if (searchUsername.trim()) filters.username = searchUsername;

      console.log("🔍 Discover filters:", filters);
      console.log("🔑 Token:", token.substring(0, 20) + "...");

      const response = await profileAPI.discover(token, filters);

      console.log("📡 API Response:", response);

      if (response.success && response.users) {
        setUsers(response.users);
        console.log(`✅ ${response.users.length} kullanıcı bulundu`);
        Alert.alert("Başarılı", `${response.users.length} kullanıcı bulundu`);
      } else {
        Alert.alert("Hata", response.error || "Kullanıcılar keşfedilemedi");
        setUsers([]);
      }
    } catch (err) {
      console.error("❌ Discover error:", err);
      Alert.alert("Hata", "Kullanıcı listesi alınırken bir hata oluştu");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token, selectedGender, selectedCountry, searchUsername]);

  const handleSendLetter = (receiverId: string, receiverUsername: string) => {
    router.push({
      pathname: "/SendLetterModal",
      params: { receiverId, receiverUsername },
    });
  };

  const handleSearch = () => {
    discoverUsers();
  };

  const getGenderLabel = () => {
    return selectedGender === "All" ? "Cinsiyet" : selectedGender;
  };

  const getCountryLabel = () => {
    return selectedCountry === "All" ? "Ülke" : selectedCountry;
  };

  const renderUserCard = ({ item }: { item: User }) => {
    return (
      <View style={styles.userCard}>
        <View style={styles.userCardTop}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {item.avatar_url ? (
              <Text style={styles.avatarImage}>👤</Text>
            ) : (
              <Text style={styles.avatarPlaceholder}>
                {item.username ? item.username.charAt(0).toUpperCase() : "?"}
              </Text>
            )}
          </View>

          {/* Bilgiler */}
          <View style={styles.userInfoSection}>
            <View style={styles.userHeader}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.userAge}>
                , {Math.floor(Math.random() * 20) + 18}
              </Text>
            </View>

            <Text style={styles.userLocation}>
              {item.country} • {item.city},{" "}
              {item.gender === "Male"
                ? "erkek"
                : item.gender === "Female"
                  ? "kadın"
                  : "diğer"}
            </Text>

            {item.interests && (
              <Text style={styles.interests}>
                {item.interests.split(",").slice(0, 3).join(", ")}
              </Text>
            )}

            {item.bio && <Text style={styles.bio}>{item.bio}</Text>}
          </View>
        </View>

        {/* Mektup Butonu */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSendLetter(item.id, item.username)}
        >
          <Ionicons name="mail" size={16} color="#666" />
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
        <TouchableOpacity onPress={() => router.push("/ProfileScreen")}>
          <Ionicons name="person-circle" size={32} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Arama Kutusu */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Arkadaş ara..."
          placeholderTextColor="#999"
          value={searchUsername}
          onChangeText={setSearchUsername}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="checkmark-circle" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Filtreleme */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterDropdown}
          onPress={() => {
            setGenderDropdownOpen(!genderDropdownOpen);
            setCountryDropdownOpen(false);
          }}
        >
          <Text style={styles.filterText}>{getGenderLabel()}</Text>
          <Ionicons name="chevron-down" size={14} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterDropdown}
          onPress={() => {
            setCountryDropdownOpen(!countryDropdownOpen);
            setGenderDropdownOpen(false);
          }}
        >
          <Text style={styles.filterText}>{getCountryLabel()}</Text>
          <Ionicons name="chevron-down" size={14} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Cinsiyet Dropdown */}
      {genderDropdownOpen && (
        <View style={styles.dropdownMenu}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedGender(g);
                setGenderDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {g === "All" ? "Hepsi" : g}
              </Text>
              {selectedGender === g && (
                <Ionicons name="checkmark" size={14} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Ülke Dropdown */}
      {countryDropdownOpen && (
        <View style={styles.dropdownMenu}>
          {COUNTRIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedCountry(c);
                setCountryDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {c === "All" ? "Hepsi" : c}
              </Text>
              {selectedCountry === c && (
                <Ionicons name="checkmark" size={14} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Kullanıcı Listesi */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        onRefresh={discoverUsers}
        refreshing={loading}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#ccc" />
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
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#000" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    color: "#000",
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  filterSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterDropdown: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 6,
  },
  filterText: { color: "#333", fontSize: 13, fontWeight: "500" },
  dropdownMenu: {
    backgroundColor: "#EFF3F5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginHorizontal: 15,
    borderRadius: 6,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: { color: "#333", fontSize: 13 },
  userCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 12,
  },
  userCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e8e8e8",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarImage: { fontSize: 32 },
  avatarPlaceholder: { fontSize: 24, fontWeight: "bold", color: "#666" },
  userInfoSection: { flex: 1, justifyContent: "flex-start" },
  userHeader: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  username: { color: "#000", fontSize: 16, fontWeight: "600" },
  userAge: { color: "#666", fontSize: 14, fontWeight: "400" },
  userLocation: { color: "#999", fontSize: 12, marginBottom: 6 },
  interests: { color: "#999", fontSize: 11, marginBottom: 6 },
  bio: {
    color: "#666",
    fontSize: 12,
    marginVertical: 6,
    lineHeight: 16,
  },
  sendButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginTop: 8,
  },
  sendButtonText: { color: "#666", fontSize: 12, fontWeight: "500" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: { color: "#999", fontSize: 14, marginTop: 12 },
});
