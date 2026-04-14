// app/(main)/_layout.tsx

import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* Home/Dashboard */}
      <Stack.Screen name="Home" options={{ animation: "slide_from_right" }} />

      {/* Discovery */}
      <Stack.Screen
        name="DiscoverScreen"
        options={{ animation: "slide_from_right" }}
      />

      {/* Letters */}
      <Stack.Screen
        name="InboxScreen"
        options={{ animation: "slide_from_right" }}
      />

      <Stack.Screen
        name="OutboxScreen"
        options={{ animation: "slide_from_right" }}
      />

      <Stack.Screen
        name="SendLetterModal"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />

      {/* Friends */}
      <Stack.Screen
        name="FriendsScreen"
        options={{ animation: "slide_from_right" }}
      />

      {/* Profile */}
      <Stack.Screen
        name="ProfileScreen"
        options={{ animation: "slide_from_right" }}
      />

      <Stack.Screen
        name="EditProfileScreen"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
