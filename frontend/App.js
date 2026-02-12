import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { LoginScreen } from "./app/(auth)/LoginScreen";
import { RegisterScreen } from "./app/(auth)/RegisterScreen";
import { ChatScreen } from "./app/(main)/ChatScreen";
import { RoomListScreen } from "./app/(main)/RoomListScreen";
import { AuthContext, AuthProvider } from "./src/context/AuthContext";

const Stack = createNativeStackNavigator();

const NavigationStack = () => {
  const { token, loading } = React.useContext(AuthContext);

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {token ? (
        <>
          <Stack.Screen name="RoomList" component={RoomListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <NavigationStack />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
