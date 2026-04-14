// src/utils/api.js - FRONTEND (MOBİL) TARAFI

// IPv4 adresini 'ipconfig' ile kontrol etmeyi unutma!
export const API_BASE_URL = "http://192.168.152.67:3000";

// --- AUTH API (Giriş, Kayıt, Profil Güncelleme) ---
export const authAPI = {
  register: async (username, email, password, gender, country, city) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          gender,
          country,
          city,
        }),
      });
      return await res.json();
    } catch (error) {
      return { success: false, error: "Sunucuya bağlanılamadı!" };
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (error) {
      return { success: false, error: "Giriş başarısız!" };
    }
  },

  updateProfile: async (token, bio, avatar_url, interests) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio, avatar_url, interests }),
      });
      return await res.json();
    } catch (error) {
      return { success: false, error: "Profil güncellenemedi." };
    }
  },
};

// --- LETTER API (Keşfet ve Mektup İşlemleri) ---
export const letterAPI = {
  // KEŞFET: Backend'de /auth/discover olarak tanımladığımız yer
  discover: async (token, filters = {}) => {
    try {
      let url = `${API_BASE_URL}/auth/discover`;
      const params = new URLSearchParams();
      if (filters.gender) params.append("gender", filters.gender);
      if (filters.country) params.append("country", filters.country);
      if (filters.username) params.append("username", filters.username);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (error) {
      return { success: false, error: "Kullanıcılar getirilemedi." };
    }
  },

  getProfile: async (token, userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (error) {
      return { success: false, error: "Profil bilgisi alınamadı." };
    }
  },

  sendLetter: async (token, receiverId, content) => {
    try {
      const res = await fetch(`${API_BASE_URL}/letters/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId, content }),
      });
      return await res.json();
    } catch (error) {
      return { success: false, error: "Mektup gönderilemedi." };
    }
  },

  getInbox: async (token) => {
    const res = await fetch(`${API_BASE_URL}/letters/inbox`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  },

  getOutbox: async (token) => {
    const res = await fetch(`${API_BASE_URL}/letters/outbox`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  },
};
