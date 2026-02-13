const { pool } = require('../db');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');

module.exports = async (fastify) => {
  // REGISTER (Kullanıcı kayıt - Gender, Country, City ile)
  fastify.post('/register', async (req, reply) => {
    const { username, email, password, gender, country, city } = req.body;

    // Validasyon
    if (!username || !email || !password || !gender || !country || !city) {
      return reply.status(400).send({
        error: 'All fields required (username, email, password, gender, country, city)'
      });
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return reply.status(400).send({ error: 'Invalid gender' });
    }

    try {
      // Şifreyi hash'le
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2i,
        memoryCost: 2 ** 16
      });

      const userId = uuid();

      // DB'ye ekle
      await pool.query(
        `INSERT INTO users (id, username, email, password_hash, gender, country, city)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, username, email, passwordHash, gender, country, city]
      );

      // JWT token oluştur
      const token = fastify.jwt.sign(
        { id: userId, username, email, gender, country, city },
        { expiresIn: '30d' }
      );

      return {
        success: true,
        token,
        user: { 
          id: userId, 
          username, 
          email, 
          gender, 
          country, 
          city 
        }
      };
    } catch (err) {
      console.error('Register error:', err.message);

      // Duplicate check
      if (err.code === '23505') {
        return reply.status(409).send({
          error: 'Username or email already exists'
        });
      }

      return reply.status(500).send({ error: 'Registration failed' });
    }
  });

  // LOGIN
  fastify.post('/login', async (req, reply) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return reply.status(400).send({
        error: 'Email and password required'
      });
    }

    try {
      // User'ı bul
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return reply.status(401).send({
          error: 'Invalid email or password'
        });
      }

      const user = result.rows[0];

      // Şifreyi doğrula
      const passwordValid = await argon2.verify(
        user.password_hash,
        password
      );

      if (!passwordValid) {
        return reply.status(401).send({
          error: 'Invalid email or password'
        });
      }

      // JWT token oluştur
      const token = fastify.jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          gender: user.gender,
          country: user.country,
          city: user.city
        },
        { expiresIn: '30d' }
      );

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          gender: user.gender,
          country: user.country,
          city: user.city,
          bio: user.bio,
          avatar_url: user.avatar_url,
          interests: user.interests
        }
      };
    } catch (err) {
      console.error('Login error:', err.message);
      return reply.status(500).send({ error: 'Login failed' });
    }
  });

  // GET /profile/:userId (Kullanıcı profilini göster)
  fastify.get('/profile/:userId', async (req, reply) => {
    const { userId } = req.params;

    try {
      const result = await pool.query(
        `SELECT id, username, gender, country, city, bio, avatar_url, interests, created_at
         FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const user = result.rows[0];

      // Mektup istatistikleri
      const stats = await pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM letters WHERE sender_id = $1) as sent_count,
          (SELECT COUNT(*) FROM letters WHERE receiver_id = $1 AND read = true) as received_count
        `,
        [userId]
      );

      return {
        user,
        stats: stats.rows[0]
      };
    } catch (err) {
      console.error('Get profile error:', err.message);
      return reply.status(500).send({ error: 'Failed to fetch profile' });
    }
  });

  // PUT /profile (Profil güncelle)
  fastify.put('/profile', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    const { username, bio, avatar_url, interests } = req.body;

    try {
      // Username değişimi kontrolü (maksimum 1 defa)
      if (username && username !== req.user.username) {
        const usernameChangeResult = await pool.query(
          'SELECT username_change_count FROM users WHERE id = $1',
          [userId]
        );

        if (usernameChangeResult.rows[0].username_change_count >= 1) {
          return reply.status(403).send({
            error: 'You can only change username once'
          });
        }

        // Update username
        await pool.query(
          `UPDATE users SET username = $1, username_change_count = username_change_count + 1 
           WHERE id = $2`,
          [username, userId]
        );
      }

      // Diğer bilgileri update et
      if (bio || avatar_url || interests) {
        await pool.query(
          `UPDATE users SET 
            bio = COALESCE($1, bio),
            avatar_url = COALESCE($2, avatar_url),
            interests = COALESCE($3, interests),
            updated_at = NOW()
           WHERE id = $4`,
          [bio, avatar_url, interests, userId]
        );
      }

      return { success: true, message: 'Profile updated' };
    } catch (err) {
      console.error('Update profile error:', err.message);
      return reply.status(500).send({ error: 'Failed to update profile' });
    }
  });
};