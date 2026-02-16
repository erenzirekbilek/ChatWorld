// src/utils/api.ts

export const API_BASE_URL = "http://192.168.1.110:3000";

// ============ AUTH API ============
export const authAPI = {
  register: async (
    username: string,
    email: string,
    password: string,
    gender: string,
    country: string,
    city: string,
  ) => {
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
      return res.json();
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Network error" };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  },
};

// ============ PROFILE API ============
export const profileAPI = {
  // Discover users with filters - GET /profile/discover
  discover: async (
    token: string,
    filters?: {
      country?: string;
      city?: string;
      gender?: string;
      username?: string;
    },
  ) => {
    try {
      let url = `${API_BASE_URL}/profile/discover`;
      const params = new URLSearchParams();

      if (filters?.country && filters.country !== "All") {
        params.append("country", filters.country);
      }
      if (filters?.city && filters.city !== "All") {
        params.append("city", filters.city);
      }
      if (filters?.gender && filters.gender !== "All") {
        params.append("gender", filters.gender);
      }
      if (filters?.username) {
        params.append("username", filters.username);
      }

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      console.log("🔍 Discover URL:", url);
      console.log("🔑 Token:", token.substring(0, 20) + "...");

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("📡 Discover Response:", data);
      return data;
    } catch (error) {
      console.error("❌ Discover error:", error);
      return { success: false, error: "Failed to discover users" };
    }
  },

  // Update profile - PUT /profile
  updateProfile: async (
    token: string,
    bio?: string,
    avatar_url?: string,
    interests?: string,
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio,
          avatar_url,
          interests,
        }),
      });
      return res.json();
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: "Failed to update profile" };
    }
  },

  // Get profile - GET /profile/:id
  getProfile: async (token: string, userId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    } catch (error) {
      console.error("Get profile error:", error);
      return { success: false, error: "Failed to fetch profile" };
    }
  },
};

// ============ LETTERS API ============
export const letterAPI = {
  // Send letter - POST /letters/send
  sendLetter: async (token: string, receiverId: string, content: string) => {
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
      console.error("Send letter error:", error);
      return { success: false, error: "Failed to send letter" };
    }
  },

  // Get inbox - GET /letters/inbox
  getInbox: async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/letters/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    } catch (error) {
      console.error("Get inbox error:", error);
      return { success: false, error: "Failed to fetch inbox" };
    }
  },

  // Mark letter as read - PUT /letters/:letterId/read
  markAsRead: async (token: string, letterId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/letters/${letterId}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    } catch (error) {
      console.error("Mark as read error:", error);
      return { success: false, error: "Failed to mark as read" };
    }
  },

  // Discover users (alias for profileAPI.discover)
  discover: async (
    token: string,
    filters?: {
      country?: string;
      city?: string;
      gender?: string;
      username?: string;
    },
  ) => {
    return profileAPI.discover(token, filters);
  },
};

// ============ FRIENDSHIPS API ============
export const friendshipAPI = {
  // Send friend request - POST /friendships/request
  sendRequest: async (token: string, userId2: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/friendships/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId2 }),
      });
      return res.json();
    } catch (error) {
      console.error("Send request error:", error);
      return { success: false, error: "Failed to send request" };
    }
  },

  // Accept friend request - PUT /friendships/:id/accept
  acceptRequest: async (token: string, friendshipId: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/friendships/${friendshipId}/accept`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.json();
    } catch (error) {
      console.error("Accept request error:", error);
      return { success: false, error: "Failed to accept request" };
    }
  },

  // Reject friend request - PUT /friendships/:id/reject
  rejectRequest: async (token: string, friendshipId: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/friendships/${friendshipId}/reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.json();
    } catch (error) {
      console.error("Reject request error:", error);
      return { success: false, error: "Failed to reject request" };
    }
  },

  // Get friends list - GET /friendships
  getFriends: async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/friendships`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    } catch (error) {
      console.error("Get friends error:", error);
      return { success: false, error: "Failed to fetch friends" };
    }
  },

  // Get pending requests - GET /friendships/pending
  getPendingRequests: async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/friendships/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    } catch (error) {
      console.error("Get pending error:", error);
      return { success: false, error: "Failed to fetch pending requests" };
    }
  },

  // Delete friendship - DELETE /friendships/:id
  removeFriend: async (token: string, friendshipId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/friendships/${friendshipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    } catch (error) {
      console.error("Remove friend error:", error);
      return { success: false, error: "Failed to remove friend" };
    }
  },

  // Block user - PUT /friendships/:id/block
  blockUser: async (token: string, friendshipId: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/friendships/${friendshipId}/block`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.json();
    } catch (error) {
      console.error("Block user error:", error);
      return { success: false, error: "Failed to block user" };
    }
  },
};
