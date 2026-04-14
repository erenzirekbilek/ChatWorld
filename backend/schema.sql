-- UUID extension (Neon / Supabase genelde hazır gelir ama garanti olsun)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================
-- USERS
-- ================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),

  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,

  bio TEXT CHECK (length(bio) <= 500),

  avatar_url VARCHAR(500),

  interests VARCHAR(500),

  username_change_count INT DEFAULT 0 CHECK (username_change_count >= 0),

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ================================
-- LETTERS (CORE FEATURE)
-- ================================
CREATE TABLE IF NOT EXISTS letters (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  sender_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  receiver_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  content TEXT NOT NULL
    CHECK (length(content) BETWEEN 1 AND 5000),

  read BOOLEAN NOT NULL DEFAULT FALSE,

  -- Slowly tarzı gecikmeli teslim için
  sent_at TIMESTAMP NOT NULL DEFAULT NOW(),

  delivered_at TIMESTAMP,

  read_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- kendine mektup gönderemezsin
  CONSTRAINT no_self_letter CHECK (sender_id != receiver_id)
);

-- ================================
-- FRIENDSHIPS
-- ================================
CREATE TABLE IF NOT EXISTS friendships (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id_1 UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  user_id_2 UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'blocked')),

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  accepted_at TIMESTAMP,

  CONSTRAINT no_self_friendship CHECK (user_id_1 != user_id_2),

  UNIQUE(user_id_1, user_id_2)
);

-- ================================
-- STAMPS (Gamification)
-- ================================
CREATE TABLE IF NOT EXISTS stamps (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  stamp_type VARCHAR(50) NOT NULL,

  count INT NOT NULL DEFAULT 1 CHECK (count >= 0),

  collected_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, stamp_type)
);

-- ================================
-- INDEXES (VERY IMPORTANT FOR PERFORMANCE)
-- ================================

-- Letters
CREATE INDEX IF NOT EXISTS idx_letters_sender
ON letters(sender_id);

CREATE INDEX IF NOT EXISTS idx_letters_receiver
ON letters(receiver_id);

CREATE INDEX IF NOT EXISTS idx_letters_inbox
ON letters(receiver_id, delivered_at DESC);

CREATE INDEX IF NOT EXISTS idx_letters_read
ON letters(receiver_id, read);

CREATE INDEX IF NOT EXISTS idx_letters_delivered
ON letters(delivered_at);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_location
ON users(country, city);

CREATE INDEX IF NOT EXISTS idx_users_username
ON users(username);

-- Friendships
CREATE INDEX IF NOT EXISTS idx_friendships_user1
ON friendships(user_id_1);

CREATE INDEX IF NOT EXISTS idx_friendships_user2
ON friendships(user_id_2);

CREATE INDEX IF NOT EXISTS idx_friendships_status
ON friendships(status);

-- Stamps
CREATE INDEX IF NOT EXISTS idx_stamps_user
ON stamps(user_id);

-- ================================
-- AUTO UPDATE TRIGGERS
-- ================================

-- Users için (zaten var)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Friendships için (accepted_at otomatik set edilsin)
CREATE OR REPLACE FUNCTION update_friendships_accepted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    NEW.accepted_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_friendships_accepted_at ON friendships;

CREATE TRIGGER update_friendships_accepted_at
BEFORE UPDATE ON friendships
FOR EACH ROW
EXECUTE FUNCTION update_friendships_accepted_at();