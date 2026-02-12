import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function RootLayout() {
  const { token, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="(main)" options={{ animation: "none" }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ animation: "none" }} />
      )}
    </Stack>
  );
}

export default function Layout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </PaperProvider>
  );
}
