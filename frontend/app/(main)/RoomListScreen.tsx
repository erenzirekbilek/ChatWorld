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
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomAPI.getRooms();
      setRooms(data);
    } catch {
      Alert.alert("Error", "Failed to fetch rooms");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert("Error", "Room name required");
      return;
    }

    try {
      if (!token) return;

      const result = await roomAPI.createRoom(newRoomName, token);

      if (result.success) {
        setNewRoomName("");
        setShowCreateInput(false);
        await fetchRooms();
        Alert.alert("Success", "Room created!");
      }
    } catch {
      Alert.alert("Error", "Failed to create room");
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      if (!token) return;

      const result = await roomAPI.joinRoom(roomId, token);

      if (result.success) {
        router.push({
          pathname: "/(main)/ChatScreen",
          params: { roomId },
        });
      }
    } catch {
      Alert.alert("Error", "Failed to join room");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ChatWorld</Text>
          <Text style={styles.headerSubtitle}>@{user?.username}</Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#ff6b6b" />
        </TouchableOpacity>
      </View>

      {showCreateInput && (
        <View style={styles.createRoomContainer}>
          <TextInput
            style={styles.createRoomInput}
            placeholder="Room name..."
            placeholderTextColor="#888"
            value={newRoomName}
            onChangeText={setNewRoomName}
          />

          <TouchableOpacity onPress={createRoom}>
            <Ionicons name="checkmark" size={24} color="#4f46e5" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowCreateInput(false)}>
            <Ionicons name="close" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomItem}
            onPress={() => joinRoom(item.id)}
          >
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.roomBy}>by {item.created_by_username}</Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color="#4f46e5" />
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              color: "#888",
            }}
          >
            No rooms found.
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateInput(!showCreateInput)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  createRoomContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#16213e",
    borderBottomWidth: 1,
    borderBottomColor: "#4f46e5",
    gap: 8,
  },

  createRoomInput: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4f46e5",
  },

  roomItem: {
    backgroundColor: "#1a1a2e",
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },

  roomInfo: {
    flex: 1,
  },

  roomName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  roomBy: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },

  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
});
