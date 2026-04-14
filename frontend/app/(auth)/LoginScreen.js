import { useRouter } from "expo-router";
import { useState } from "react";
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
import { useAuth } from "../../components/hooks/useAuth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    // 1. Boş alan kontrolü
    if (!email.trim() || !password.trim()) {
      Alert.alert("Hata", "Email ve şifre zorunludur.");
      return;
    }

    setLoading(true);

    // 2. AuthContext üzerinden giriş işlemi
    const result = await login(email, password);
    setLoading(false);

    // 3. Yanıt kontrolü ve Yönlendirme
    if (!result.success) {
      Alert.alert(
        "Giriş Başarısız",
        result.error || "Bilgilerinizi kontrol edin.",
      );
    } else {
      // BAŞARILI: Kullanıcıyı Keşfet ekranına gönderiyoruz
      console.log("Giriş başarılı, DiscoverScreen'e yönlendiriliyor...");
      router.replace("/(main)/Home");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>ChatWorld</Text>
        <Text style={styles.subtitle}>Mektup Arkadaşını Keşfet</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
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

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Giriş yapılıyor..." : "GİRİŞ YAP"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/RegisterScreen")}
          disabled={loading}
        >
          <Text style={styles.link}>
            Hesabın yok mu? <Text style={styles.linkBold}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#16213e",
    color: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4f46e5",
    fontSize: 14,
  },
  button: {
    marginVertical: 15,
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#9ca3af",
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
  },
  linkBold: {
    color: "#4f46e5",
    fontWeight: "600",
  },
});
