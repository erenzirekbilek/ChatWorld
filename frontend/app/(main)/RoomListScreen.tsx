import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useAuth } from "../../components/hooks/useAuth";
import { Room } from "../types";
import { roomAPI } from "../utils/api";

export default function RoomListScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const { token, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    try {
      if (!token) return;
      const data = await roomAPI.getRooms(token); // artık doğru
      if (Array.isArray(data)) setRooms(data);
    } catch (error) {
      console.error("Fetch hatası:", error);
      Alert.alert("Hata", "Odalar yüklenirken bir sorun oluştu.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert("Hata", "Oda adı gerekli");
      return;
    }

    try {
      if (!token) {
        Alert.alert("Hata", "Oturum bilgisi bulunamadı.");
        return;
      }

      const result = await roomAPI.createRoom(newRoomName, token);

      if (result.success) {
        setNewRoomName("");
        setShowCreateInput(false);
        await fetchRooms();
        Alert.alert("Başarılı", "Oda oluşturuldu!");
      } else {
        Alert.alert("Hata", result.error || "Oda oluşturulamadı.");
      }
    } catch (error) {
      Alert.alert("Hata", "Oda oluşturulurken bir hata oluştu.");
    }
  };

  const joinRoom = (roomId: string | number) => {
    router.push(`/(main)/ChatScreen?roomId=${roomId}`);
  };

  const handleLogout = () => {
    Alert.alert("Çıkış", "Çıkış yapmak istediğinize emin misiniz?", [
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
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ChatWorld</Text>
          <Text style={styles.headerSubtitle}>
            Hoş geldin, {user?.username || "Kullanıcı"}
          </Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="#ff6b6b" />
        </TouchableOpacity>
      </View>

      {showCreateInput && (
        <View style={styles.createRoomContainer}>
          <TextInput
            style={styles.createRoomInput}
            placeholder="Oda adı yazın..."
            placeholderTextColor="#888"
            value={newRoomName}
            onChangeText={setNewRoomName}
            autoFocus
          />

          <TouchableOpacity onPress={createRoom} style={styles.actionButton}>
            <Ionicons name="checkmark-circle" size={32} color="#4ade80" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowCreateInput(false)}
            style={styles.actionButton}
          >
            <Ionicons name="close-circle" size={32} color="#f87171" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomItem}
            onPress={() => joinRoom(item.id)}
          >
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.roomBy}>
                Oluşturan: {item.createdBy || "Sistem"}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#4f46e5" />
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz oda bulunmuyor.</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateInput(!showCreateInput)}
      >
        <Ionicons name="add" size={35} color="#fff" />
      </TouchableOpacity>
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
  headerSubtitle: { fontSize: 14, color: "#888", marginTop: 4 },
  createRoomContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#16213e",
    borderBottomWidth: 2,
    borderBottomColor: "#4f46e5",
    alignItems: "center",
    gap: 10,
  },
  createRoomInput: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    fontSize: 16,
  },
  actionButton: { justifyContent: "center", alignItems: "center" },
  roomItem: {
    backgroundColor: "#1a1a2e",
    padding: 18,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  roomInfo: { flex: 1 },
  roomName: { color: "#fff", fontSize: 18, fontWeight: "600" },
  roomBy: { color: "#94a3b8", fontSize: 13, marginTop: 6 },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#64748b",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
