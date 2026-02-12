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
}
