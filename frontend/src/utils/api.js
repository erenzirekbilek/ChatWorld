// IPv4 adresini 'ipconfig' ile kontrol etmeyi unutma!
// Eğer IP değişirse burayı güncellemen gerekir.
export const API_BASE_URL = "http://192.168.1.103:3000";

// --- AUTH API ---
export const authAPI = {
  // Kayıt olma
  register: async (username, email, password, gender, country, city) => {
    try {
      console.log("🚀 Kayıt isteği gönderiliyor:", { username, email });
      const res = await fetch(`${API_BASE_URL}/register`, {
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
      const data = await res.json();
      console.log("✅ Kayıt Yanıtı:", data);
      return data;
    } catch (error) {
      console.error("❌ Kayıt Hatası:", error);
      return { success: false, error: "Sunucuya bağlanılamadı!" };
    }
  },

  // Giriş yapma
  login: async (email, password) => {
    try {
      console.log("🔑 Giriş isteği gönderiliyor:", email);
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("✅ Giriş Yanıtı:", data);
      return data;
    } catch (error) {
      console.error("❌ Giriş Hatası:", error);
      return { success: false, error: "Sunucuya bağlanılamadı!" };
    }
  },
};

// --- LETTER API ---
export const letterAPI = {
  // Kullanıcı keşfet (filtreleme ile)
  discover: async (token, filters = {}) => {
    try {
      let url = `${API_BASE_URL}/discover`;
      const params = new URLSearchParams();
      if (filters.country) params.append("country", filters.country);
      if (filters.city) params.append("city", filters.city);
      if (filters.gender) params.append("gender", filters.gender);
      if (filters.username) params.append("username", filters.username);

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    } catch (error) {
      console.error("Discover Hatası:", error);
      return { success: false, error: "Kullanıcılar getirilemedi." };
    }
  },

  // Mektup gönder
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
      return res.json();
    } catch (error) {
      console.error("Send Letter Hatası:", error);
      return { success: false, error: "Mektup gönderilemedi." };
    }
  },

  // Inbox (alınan mektuplar)
  getInbox: async (token) => {
    const res = await fetch(`${API_BASE_URL}/letters/inbox`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Outbox (gönderilen mektuplar)
  getOutbox: async (token) => {
    const res = await fetch(`${API_BASE_URL}/letters/outbox`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Mektup oku / Okundu olarak işaretle
  markAsRead: async (token, letterId) => {
    const res = await fetch(`${API_BASE_URL}/letters/${letterId}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // İstatistikler
  getStatistics: async (token) => {
    const res = await fetch(`${API_BASE_URL}/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Pul koleksiyonu
  getStamps: async (token) => {
    const res = await fetch(`${API_BASE_URL}/stamps`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Profil bilgisi
  getProfile: async (token, userId) => {
    const res = await fetch(`${API_BASE_URL}/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};

// --- ROOM API ---
export const roomAPI = {
  getRooms: async (token) => {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch rooms");
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
    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.message || "Failed to create room",
      };
    }
    return { success: true };
  },

  joinRoom: async (roomId, token) => {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getMessages: async (roomId, token) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/messages/${roomId}`, { headers });
    return res.json();
  },
};
