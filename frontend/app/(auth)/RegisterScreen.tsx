import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";

const GENDERS = ["Male", "Female", "Other"];
const COUNTRIES = ["Turkey", "USA", "Germany", "France", "Japan", "Other"];
const CITIES: Record<string, string[]> = {
  Turkey: ["Istanbul", "Ankara", "Izmir", "Antalya", "Kars", "Trabzon"],
  USA: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  Germany: ["Berlin", "Munich", "Frankfurt", "Hamburg"],
  France: ["Paris", "Lyon", "Marseille", "Toulouse"],
  Japan: ["Tokyo", "Osaka", "Kyoto", "Yokohama"],
  Other: ["Other"],
};

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    // 1. Validasyon Kontrolleri
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (!gender || !country || !city) {
      Alert.alert("Hata", "Cinsiyet, ülke ve şehir seçimi zorunludur.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Hata", "Şifreler uyuşmuyor.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
      return;
    }

    try {
      setLoading(true);
      // 2. AuthContext üzerinden Backend'e veri gönderimi
      const result = await register(
        username,
        email,
        password,
        gender,
        country,
        city,
      );

      if (result.success) {
        Alert.alert("Başarılı", "Hesabınız oluşturuldu!");
        // (tabs) veya (main) yapına göre yolu güncelle
        router.replace("/(main)/DiscoverScreen" as any);
      } else {
        Alert.alert("Kayıt Başarısız", result.error || "Bir hata oluştu.");
      }
    } catch (err: any) {
      Alert.alert("Hata", "Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const citiesForCountry = CITIES[country] || [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#4f46e5" />
          </TouchableOpacity>

          <Text style={styles.title}>Yeni Hesap Oluştur</Text>

          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre Onay"
            placeholderTextColor="#888"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
            editable={!loading}
          />

          {/* Cinsiyet Seçimi */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Cinsiyet</Text>
            <View style={styles.pickerButtonsRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.pickerButton,
                    gender === g && styles.pickerButtonSelected,
                  ]}
                  onPress={() => setGender(g)}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      gender === g && styles.pickerButtonTextSelected,
                    ]}
                  >
                    {g === "Male"
                      ? "Erkek"
                      : g === "Female"
                        ? "Kadın"
                        : "Diğer"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ülke Seçimi */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Ülke</Text>
            <View style={styles.pickerButtonsRow}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.pickerButton,
                    country === c && styles.pickerButtonSelected,
                  ]}
                  onPress={() => {
                    setCountry(c);
                    setCity("");
                  }}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      country === c && styles.pickerButtonTextSelected,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Şehir Seçimi (Ülke seçilince görünür) */}
          {country && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Şehir</Text>
              <View style={styles.pickerButtonsRow}>
                {citiesForCountry.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.pickerButton,
                      city === c && styles.pickerButtonSelected,
                    ]}
                    onPress={() => setCity(c)}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        city === c && styles.pickerButtonTextSelected,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Kaydediliyor..." : "KAYIT OL"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/LoginScreen" as any)}
          >
            <Text style={styles.link}>
              Zaten hesabın var mı?{" "}
              <Text style={styles.linkBold}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1e" },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  backButton: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#16213e",
    color: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4f46e5",
    fontSize: 14,
  },
  pickerContainer: { marginVertical: 12 },
  pickerLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  pickerButtonsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pickerButton: {
    backgroundColor: "#16213e",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  pickerButtonSelected: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  pickerButtonText: { color: "#9ca3af", fontSize: 12, fontWeight: "500" },
  pickerButtonTextSelected: { color: "#fff" },
  button: {
    marginVertical: 20,
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: "#9ca3af", textAlign: "center", fontSize: 14, marginTop: 10 },
  linkBold: { color: "#4f46e5", fontWeight: "bold" },
});
