import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right", // default animasyon
      }}
    >
      <Stack.Screen
        name="LoginScreen"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="RegisterScreen"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
