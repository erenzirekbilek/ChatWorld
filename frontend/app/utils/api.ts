export const API_BASE_URL = "http://192.168.1.103:3000";
// Düzenle: bilgisayar LAN IP’n ile. Expo Go cihazı aynı ağda olmalı.

export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
};

export const roomAPI = {
  // Token parametresi eklendi
  getRooms: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Odalar alınamadı");
    return res.json();
  },

  createRoom: async (name: string, token: string) => {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const error = await res.json();
      return { success: false, error: error.message || "Oda oluşturulamadı" };
    }
    return { success: true };
  },

  joinRoom: async (roomId: string, token: string) => {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  },

  getMessages: async (roomId: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/messages/${roomId}`, { headers });
    return res.json();
  },
};
