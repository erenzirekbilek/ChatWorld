import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import { letterAPI } from "../../src/utils/api";

const STATUSBAR_HEIGHT =
  Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

export default function SendLetterModal() {
  const { receiverId, receiverUsername } = useLocalSearchParams<{
    receiverId: string;
    receiverUsername: string;
  }>();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const { token } = useAuth();
  const router = useRouter();

  const MAX_CHARS = 1000;
  const isButtonDisabled = loading || !content.trim();

  const handleSendLetter = async () => {
    if (isButtonDisabled) return;
    setLoading(true);
    try {
      const response = await letterAPI.sendLetter(token, receiverId, content);
      if (response.success) {
        Alert.alert("Mühürlendi!", "Mektubun yola çıktı.", [
          { text: "Harika", onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      Alert.alert("Hata", "Mektup gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header - Minimalist & Modern */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Mektup</Text>
        <TouchableOpacity
          onPress={handleSendLetter}
          disabled={isButtonDisabled}
          style={[styles.sendBtn, isButtonDisabled && styles.sendBtnDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Gönder</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mektup Kağıdı Tasarımı */}
          <View style={styles.paper}>
            <View style={styles.paperHeader}>
              <View>
                <Text style={styles.toLabel}>ALICI</Text>
                <Text style={styles.receiverName}>@{receiverUsername}</Text>
              </View>
              <View style={styles.vintageStamp}>
                <Ionicons name="ribbon-outline" size={24} color="#8d6e63" />
                <Text style={styles.stampText}>AIR MAIL</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Mektup İçeriği - Çizgili Kağıt Efekti */}
            <TextInput
              style={styles.letterInput}
              placeholder="Mektubuna güzel bir selamla başla..."
              placeholderTextColor="#a2a2a2"
              value={content}
              onChangeText={(t) => {
                setContent(t);
                setCharCount(t.length);
              }}
              multiline
              autoFocus
              maxLength={MAX_CHARS}
              textAlignVertical="top"
            />

            <View style={styles.paperFooter}>
              <Text style={styles.charCounter}>
                {charCount} / {MAX_CHARS}
              </Text>
              <Text style={styles.handwriting}>Sevgilerle...</Text>
            </View>
          </View>

          {/* Aksiyonlar */}
          <View style={styles.attachmentBar}>
            <TouchableOpacity style={styles.attachBtn}>
              <Ionicons name="image-outline" size={20} color="#5d4037" />
              <Text style={styles.attachText}>Fotoğraf</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachBtn}>
              <Ionicons name="gift-outline" size={20} color="#5d4037" />
              <Text style={styles.attachText}>Hediye</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1EA", // Hafif kirli beyaz/kağıt rengi
  },
  header: {
    paddingTop: STATUSBAR_HEIGHT,
    height: STATUSBAR_HEIGHT + 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#F4F1EA",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  closeBtn: { padding: 5 },
  sendBtn: {
    backgroundColor: "#5d4037", // Mektup mühürü kahvesi
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendBtnDisabled: { backgroundColor: "#ccc" },
  sendBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  scrollContent: { padding: 20 },

  // Mektup Kağıdı
  paper: {
    backgroundColor: "#fff",
    borderRadius: 2,
    padding: 25,
    minHeight: 500,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  paperHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  toLabel: {
    fontSize: 10,
    color: "#9e9e9e",
    letterSpacing: 1,
    fontWeight: "700",
  },
  receiverName: {
    fontSize: 20,
    color: "#333",
    fontWeight: "600",
    marginTop: 2,
  },
  vintageStamp: {
    borderWidth: 1,
    borderColor: "#8d6e63",
    padding: 5,
    alignItems: "center",
    borderRadius: 4,
    borderStyle: "dashed",
  },
  stampText: { fontSize: 8, color: "#8d6e63", fontWeight: "800", marginTop: 2 },
  divider: {
    height: 2,
    backgroundColor: "#5d4037",
    width: 40,
    marginBottom: 20,
  },

  letterInput: {
    fontSize: 17,
    color: "#444",
    lineHeight: 28, // Satır aralığı mektup hissi için önemli
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Cochin" : "serif",
  },

  paperFooter: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCounter: { fontSize: 12, color: "#ccc" },
  handwriting: {
    fontSize: 18,
    color: "#5d4037",
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Snell Roundhand" : "serif",
  },

  attachmentBar: {
    flexDirection: "row",
    marginTop: 20,
    gap: 15,
  },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(93, 64, 55, 0.05)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(93, 64, 55, 0.1)",
  },
  attachText: {
    marginLeft: 8,
    color: "#5d4037",
    fontWeight: "600",
    fontSize: 13,
  },
});
