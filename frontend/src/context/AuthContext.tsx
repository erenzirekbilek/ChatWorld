import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../../app/utils/api";

// Tipler
export interface User {
  id: string;
  username: string;
  email: string;
  gender?: string;
  country?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
  interests?: string;
}

interface DecodedToken {
  id: string;
  username: string;
  email: string;
  gender?: string;
  country?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
  interests?: string;
  exp: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    email: string,
    password: string,
    gender: string,
    country: string,
    city: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await AsyncStorage.getItem("userToken");
      if (savedToken) {
        const decoded = jwtDecode<DecodedToken>(savedToken);

        // Token süresi kontrol
        if (decoded.exp * 1000 < Date.now()) {
          await logout();
        } else {
          setToken(savedToken);
          setUser({
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            gender: decoded.gender,
            country: decoded.country,
            city: decoded.city,
            bio: decoded.bio,
            avatar_url: decoded.avatar_url,
            interests: decoded.interests,
          });
        }
      }
    } catch (err) {
      console.error("Auth Bootstrap Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const data = await authAPI.login(email, password);

      if (!data.success) throw new Error(data.error || "Login failed");

      await AsyncStorage.setItem("userToken", data.token);

      const decoded = jwtDecode<DecodedToken>(data.token);
      const userData: User = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        gender: decoded.gender,
        country: decoded.country,
        city: decoded.city,
        bio: decoded.bio,
        avatar_url: decoded.avatar_url,
        interests: decoded.interests,
      };

      setToken(data.token);
      setUser(userData);

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    gender: string,
    country: string,
    city: string,
  ) => {
    try {
      setError(null);
      const data = await authAPI.register(
        username,
        email,
        password,
        gender,
        country,
        city,
      );

      if (!data.success) throw new Error(data.error || "Registration failed");

      await AsyncStorage.setItem("userToken", data.token);

      const decoded = jwtDecode<DecodedToken>(data.token);
      const userData: User = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        gender: decoded.gender,
        country: decoded.country,
        city: decoded.city,
        bio: decoded.bio,
        avatar_url: decoded.avatar_url,
        interests: decoded.interests,
      };

      setToken(data.token);
      setUser(userData);

      return { success: true };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
