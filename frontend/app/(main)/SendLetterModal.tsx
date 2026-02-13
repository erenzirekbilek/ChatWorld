import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import { letterAPI } from "../../src/utils/api";

export default function SendLetterModal() {
  const { receiverId, receiverUsername } = useLocalSearchParams<{
    receiverId: string;
    receiverUsername: string;
  }>();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const { token, user } = useAuth();
  const router = useRouter();

  const MAX_CHARS = 500;

  const handleSendLetter = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please write something");
      return;
    }

    if (!receiverId || !token) {
      Alert.alert("Error", "Missing information");
      return;
    }

    setLoading(true);

    try {
      const response = await letterAPI.sendLetter(token, receiverId, content);

      if (response.success) {
        Alert.alert("Success", `Letter sent to ${receiverUsername}!`, [
          {
            text: "OK",
            onPress: () => {
              setContent("");
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to send letter");
      }
    } catch (err) {
      console.error("Send letter error:", err);
      Alert.alert("Error", "Failed to send letter");
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      setContent(text);
      setCharCount(text.length);
    }
  };

  // Mektup iletim süresini hesapla (demo amaçlı)
  const estimatedDeliveryTime = `6-24 hours`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Letter</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Recipient Info */}
      <View style={styles.recipientContainer}>
        <View style={styles.recipientAvatar}>
          <Text style={styles.avatarText}>
            {receiverUsername?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.recipientName}>{receiverUsername}</Text>
          <View style={styles.estimatedRow}>
            <Ionicons name="time" size={14} color="#10b981" />
            <Text style={styles.estimatedText}>~{estimatedDeliveryTime}</Text>
          </View>
        </View>
      </View>

      {/* Stamp Animation */}
      <View style={styles.stampContainer}>
        <Text style={styles.stampEmoji}>🎫</Text>
      </View>

      {/* Letter Content Input */}
      <View style={styles.letterBox}>
        <View style={styles.paperHeader}>
          <View style={styles.stampSmall} />
        </View>

        <TextInput
          style={styles.letterInput}
          placeholder={`Write your letter to ${receiverUsername}...`}
          placeholderTextColor="#666"
          value={content}
          onChangeText={handleContentChange}
          multiline
          textAlignVertical="top"
          maxLength={MAX_CHARS}
          editable={!loading}
        />

        {/* Character Count */}
        <View style={styles.charCountContainer}>
          <Text style={styles.charCount}>
            {charCount} / {MAX_CHARS}
          </Text>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Ionicons name="information-circle" size={16} color="#4f46e5" />
        <Text style={styles.tipsText}>
          Distance matters! Closer locations = faster delivery
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Discard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendLetter}
          disabled={loading || !content.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={loading || !content.trim() ? "#999" : "#fff"}
          />
          <Text style={styles.sendButtonText}>
            {loading ? "Sending..." : "Send Letter"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  header: {
    backgroundColor: "#16213e",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#4f46e5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },

  // Recipient Info
  recipientContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#16213e",
    gap: 12,
  },
  recipientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  recipientName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  estimatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  estimatedText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "500",
  },

  // Stamp
  stampContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  stampEmoji: {
    fontSize: 32,
  },

  // Letter Box
  letterBox: {
    marginHorizontal: 20,
    marginVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#4f46e5",
  },
  paperHeader: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 12,
    paddingTop: 6,
  },
  stampSmall: {
    width: 20,
    height: 20,
    backgroundColor: "#4f46e5",
    borderRadius: 2,
  },
  letterInput: {
    padding: 15,
    color: "#1f2937",
    fontSize: 14,
    minHeight: 200,
    maxHeight: 300,
  },
  charCountContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  charCount: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "right",
  },

  // Tips
  tipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#16213e",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4f46e5",
    gap: 8,
  },
  tipsText: {
    color: "#cbd5e1",
    fontSize: 12,
    flex: 1,
  },

  // Buttons
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  sendButton: {
    flex: 1,
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#374151",
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
