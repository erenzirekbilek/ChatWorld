import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import { authAPI } from "../../app/utils/api";
import { useAuth } from "../../src/context/AuthContext";

const COLORS = {
  primary: "#007AFF",
  bg: "#F8F9FC",
  white: "#FFFFFF",
  text: "#1C1C1E",
  gray: "#8E8E93",
  accent: "#E5F1FF",
  border: "#E5E5EA",
};

export default function EditProfileScreen() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState(user?.bio || "");
  const [avatar_url, setAvatarUrl] = useState(user?.avatar_url || "");
  const [interests, setInterests] = useState(user?.interests || "");
  const [loading, setLoading] = useState(false);

  const MAX_BIO = 500;
  const MAX_INTERESTS = 200;

  const handleSaveProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(
        token,
        bio,
        avatar_url,
        interests,
      );
      if (response.success) {
        Alert.alert("Başarılı", "Profilin güncellendi!", [
          { text: "Tamam", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Hata", response.error || "Güncelleme başarısız.");
      }
    } catch (err) {
      Alert.alert("Hata", "Bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity
          onPress={handleSaveProfile}
          disabled={loading}
          style={[styles.saveTopBtn, loading && { opacity: 0.5 }]}
        >
          <Text style={styles.saveTopBtnText}>
            {loading ? "..." : "Kaydet"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Preview */}
          <View style={styles.previewSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {user?.username?.charAt(0).toUpperCase()}
              </Text>
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </View>
            </View>
            <Text style={styles.usernameText}>@{user?.username}</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Biyografi</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Kendinden bahset..."
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={MAX_BIO}
                placeholderTextColor={COLORS.gray}
              />
              <Text style={styles.charCount}>
                {bio.length}/{MAX_BIO}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profil Resmi URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://gorsel-linki.com/resim.jpg"
                value={avatar_url}
                onChangeText={setAvatarUrl}
                placeholderTextColor={COLORS.gray}
              />
              <Text style={styles.hint}>
                Şimdilik sadece URL destekleniyor.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>İlgi Alanları</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Müzik, Kitap, Yazılım (virgülle ayır)"
                value={interests}
                onChangeText={setInterests}
                multiline
                maxLength={MAX_INTERESTS}
                placeholderTextColor={COLORS.gray}
              />
              <Text style={styles.charCount}>
                {interests.length}/{MAX_INTERESTS}
              </Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.infoText}>
                Bu bilgiler, insanlar seni keşfettiğinde mektup kağıdının
                üzerinde görünecek.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  closeBtn: { padding: 5 },
  saveTopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveTopBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },

  scrollContent: { paddingBottom: 40 },

  previewSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.bg,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarLetter: { fontSize: 36, fontWeight: "bold", color: COLORS.primary },
  cameraIcon: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  usernameText: { fontSize: 16, fontWeight: "600", color: COLORS.text },

  form: { padding: 20 },
  inputGroup: { marginBottom: 25 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 15,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  charCount: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: "right",
    marginTop: 6,
    marginRight: 5,
  },
  hint: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 6,
    marginLeft: 5,
    fontStyle: "italic",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.accent,
    padding: 15,
    borderRadius: 16,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    lineHeight: 18,
  },
});
