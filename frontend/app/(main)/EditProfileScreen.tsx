// app/(main)/EditProfileScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { authAPI } from "../../app/utils/api";
import { useAuth } from "../../src/context/AuthContext";

export default function EditProfileScreen() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState(user?.bio || "");
  const [avatar_url, setAvatarUrl] = useState(user?.avatar_url || "");
  const [interests, setInterests] = useState(user?.interests || "");
  const [loading, setLoading] = useState(false);

  const [charCounts, setCharCounts] = useState({
    bio: bio.length,
    interests: interests.length,
  });

  const MAX_BIO = 500;
  const MAX_INTERESTS = 200;

  const handleBioChange = (text: string) => {
    if (text.length <= MAX_BIO) {
      setBio(text);
      setCharCounts((prev) => ({ ...prev, bio: text.length }));
    }
  };

  const handleInterestsChange = (text: string) => {
    if (text.length <= MAX_INTERESTS) {
      setInterests(text);
      setCharCounts((prev) => ({ ...prev, interests: text.length }));
    }
  };

  const handleSaveProfile = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const response = await authAPI.updateProfile(
        token,
        bio || undefined,
        avatar_url || undefined,
        interests || undefined,
      );

      if (response.success) {
        Alert.alert("Success", "Profile updated successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* User Avatar Preview */}
      <View style={styles.previewContainer}>
        <View style={styles.avatarPreview}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={styles.previewUsername}>{user?.username}</Text>
        <Text style={styles.previewLocation}>
          {user?.city}, {user?.country}
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        {/* Bio Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell us about yourself"
            placeholderTextColor="#666"
            value={bio}
            onChangeText={handleBioChange}
            multiline
            textAlignVertical="top"
            maxLength={MAX_BIO}
            editable={!loading}
          />
          <View style={styles.charCountRow}>
            <Text style={styles.charCount}>
              {charCounts.bio} / {MAX_BIO}
            </Text>
          </View>
        </View>

        {/* Avatar URL Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Avatar URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/avatar.jpg"
            placeholderTextColor="#666"
            value={avatar_url}
            onChangeText={setAvatarUrl}
            keyboardType="url"
            editable={!loading}
          />
          <Text style={styles.hint}>Leave empty for default avatar</Text>
        </View>

        {/* Interests Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Interests</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="e.g. reading, travel, coding (comma separated)"
            placeholderTextColor="#666"
            value={interests}
            onChangeText={handleInterestsChange}
            multiline
            textAlignVertical="top"
            maxLength={MAX_INTERESTS}
            editable={!loading}
          />
          <View style={styles.charCountRow}>
            <Text style={styles.charCount}>
              {charCounts.interests} / {MAX_INTERESTS}
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#4f46e5" />
          <Text style={styles.infoText}>
            Your profile will be visible to other users when they discover you.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          <Ionicons
            name="checkmark"
            size={20}
            color={loading ? "#999" : "#fff"}
          />
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save Changes"}
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

  // Preview
  previewContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#16213e",
  },
  avatarPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  previewUsername: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  previewLocation: {
    fontSize: 12,
    color: "#9ca3af",
  },

  // Form
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1a1a2e",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    fontSize: 14,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCountRow: {
    marginTop: 6,
  },
  charCount: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "right",
  },
  hint: {
    fontSize: 11,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 6,
  },

  // Info Box
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16213e",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4f46e5",
    padding: 12,
    gap: 8,
    marginTop: 10,
  },
  infoText: {
    color: "#cbd5e1",
    fontSize: 12,
    flex: 1,
  },

  // Buttons
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  saveButton: {
    flex: 1,
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#374151",
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
