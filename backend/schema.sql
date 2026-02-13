CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  interests VARCHAR(500),
  username_change_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stamp_type VARCHAR(50),
  count INT DEFAULT 1,
  collected_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, stamp_type)
);

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2)
);

CREATE INDEX IF NOT EXISTS idx_letters_sender ON letters(sender_id);
CREATE INDEX IF NOT EXISTS idx_letters_receiver ON letters(receiver_id, delivered_at);
CREATE INDEX IF NOT EXISTS idx_letters_delivered ON letters(delivered_at, read);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(country, city);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_stamps_user ON stamps(user_id);