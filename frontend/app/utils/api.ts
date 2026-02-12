export const API_BASE_URL = "http://YOUR_API_URL:3000";
// Düzenle: http://192.168.1.100:3000 (local) veya https://chatworld-backend.onrender.com (production)

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
  getRooms: async () => {
    const res = await fetch(`${API_BASE_URL}/rooms`);
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
    return res.json();
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

  getMessages: async (roomId: string) => {
    const res = await fetch(`${API_BASE_URL}/messages/${roomId}`);
    return res.json();
  },
};
