export const API_BASE_URL = "http://192.168.1.100:3000";
// Örnek: 'http://192.168.1.100:3000' (kendi makinanın IP'si)
// Ör: 'https://chatworld-backend.onrender.com' (production)

export const authAPI = {
  register: async (username, email, password) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  },

  login: async (email, password) => {
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

  createRoom: async (name, token) => {
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

  joinRoom: async (roomId, token) => {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  },

  getMessages: async (roomId) => {
    const res = await fetch(`${API_BASE_URL}/messages/${roomId}`);
    return res.json();
  },
};
