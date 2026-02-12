import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../../src/context/AuthContext";
import { Message } from "../types";
import { API_BASE_URL, roomAPI } from "../utils/api";

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { token, user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingLoading, setSendingLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  // ---------------- LOAD & CONNECT ----------------

  const loadMessagesAndConnect = useCallback(async () => {
    if (!roomId || !token) return;

    try {
      const prevMessages = await roomAPI.getMessages(roomId);
      setMessages(prevMessages || []);
      setLoading(false);

      const socket = io(API_BASE_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("joinRoom", roomId);
      });

      socket.on("message", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        Alert.alert("Connection Error", "Failed to connect");
      });
    } catch {
      Alert.alert("Error", "Failed to load messages");
      setLoading(false);
    }
  }, [roomId, token]);

  useEffect(() => {
    loadMessagesAndConnect();

    return () => {
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [loadMessagesAndConnect]);

  // ---------------- SEND MESSAGE ----------------

  const sendMessage = useCallback(() => {
    if (!input.trim() || !roomId) return;

    const messageText = input;
    setInput("");
    setSendingLoading(true);

    try {
      socketRef.current?.emit("sendMessage", {
        roomId,
        content: messageText,
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch {
      Alert.alert("Error", "Failed to send message");
      setInput(messageText);
    } finally {
      setSendingLoading(false);
    }
  }, [input, roomId]);

  // ---------------- RENDER MESSAGE ----------------

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isOwnMessage = item.username === user?.username;

      return (
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {!isOwnMessage && (
            <Text style={styles.username}>{item.username}</Text>
          )}

          <Text style={styles.messageText}>{item.content}</Text>

          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      );
    },
    [user],
  );

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: "#fff" }}>Loading messages...</Text>
      </View>
    );
  }

  // ---------------- UI ----------------

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4f46e5" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Room #{roomId?.substring(0, 8)}</Text>

        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={{ color: "#aaa" }}>No messages yet...</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type message..."
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
          editable={!sendingLoading}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          onPress={sendMessage}
          disabled={sendingLoading || !input.trim()}
          style={[
            styles.sendBtn,
            (!input.trim() || sendingLoading) && styles.sendBtnDisabled,
          ]}
        >
          <Ionicons
            name="send"
            size={20}
            color={input.trim() && !sendingLoading ? "#fff" : "#999"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f1e",
  },
  header: {
    backgroundColor: "#16213e",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#4f46e5",
    marginTop: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  messageBubble: {
    marginVertical: 6,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4f46e5",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#16213e",
    borderWidth: 1,
    borderColor: "#4f46e5",
  },
  username: {
    color: "#aaa",
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "600",
  },
  messageText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 18,
  },
  timestamp: {
    color: "#888",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#16213e",
    borderTopWidth: 1,
    borderTopColor: "#4f46e5",
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4f46e5",
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#4f46e5",
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#374151",
    opacity: 0.5,
  },
});
