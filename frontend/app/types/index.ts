// app/types/index.ts

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

export interface Letter {
  id: string;
  sender_id?: string;
  receiver_id?: string;
  username: string;
  content: string;
  read: boolean;
  delivered_at: string;
  created_at: string;
  city: string;
  country: string;
  avatar_url?: string;
}

export interface Stamp {
  stamp_type: "vintage" | "modern" | "rare" | "classic";
  count: number;
}

export interface Statistics {
  sent_count: number;
  received_count: number;
  read_count: number;
  friends_count: number;
  total_stamps: number;
}

export interface Friend {
  friend_id: string;
  username: string;
  avatar_url?: string;
  city: string;
  country: string;
  bio?: string;
}

export interface Friendship {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}
