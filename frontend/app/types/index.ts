export interface Room {
  id: string;
  name: string;
  created_by: string;
  created_by_username: string;
  created_at: string;
}

export interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: string;
}

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

// YENİ: Letter
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

// YENİ: Stamp
export interface Stamp {
  stamp_type: string;
  count: number;
}

// YENİ: Statistics
export interface Statistics {
  sent_count: number;
  received_count: number;
  read_count: number;
  friends_count: number;
  total_stamps: number;
}
