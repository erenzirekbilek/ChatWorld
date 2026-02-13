const { pool } = require('../db');
const { v4: uuid } = require('uuid');

// Konum mesafesine göre mektup iletim süresi hesapla (dakika cinsinden)
const calculateDeliveryTime = (city1, city2) => {
  const sameCity = city1.toLowerCase() === city2.toLowerCase();
  
  // Aynı şehir: 10-30 dakika
  if (sameCity) {
    return Math.random() * 20 + 10;
  }
  
  // Farklı şehirler: 6-24 saat (dakikaya çevrildi)
  return (Math.random() * 18 + 6) * 60; 
};

module.exports = async (fastify) => {
  // GET /discover (Kullanıcı bul - Filtreleme ile)
  fastify.get('/discover', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    const { country, city, gender, username } = req.query;

    try {
      let query = `
        SELECT u.id, u.username, u.gender, u.country, u.city, u.bio, u.avatar_url, u.interests
        FROM users u
        WHERE u.id != $1
        AND NOT EXISTS (
          SELECT 1 FROM friendships f
          WHERE (f.user_id_1 = $1 AND f.user_id_2 = u.id)
             OR (f.user_id_1 = u.id AND f.user_id_2 = $1)
        )
      `;

      const params = [userId];

      if (country) {
        params.push(country);
        query += ` AND u.country ILIKE $${params.length}`;
      }

      if (city) {
        params.push(city);
        query += ` AND u.city ILIKE $${params.length}`;
      }

      if (gender) {
        params.push(gender);
        query += ` AND u.gender = $${params.length}`;
      }

      if (username) {
        params.push(`%${username}%`);
        query += ` AND u.username ILIKE $${params.length}`;
      }

      query += ` ORDER BY RANDOM() LIMIT 50`;

      const result = await pool.query(query, params);

      return {
        success: true,
        users: result.rows
      };
    } catch (err) {
      console.error('Discover error:', err.message);
      return reply.status(500).send({ success: false, error: 'Failed to discover users' });
    }
  });

  // POST /letters/send (Mektup gönder)
  fastify.post('/letters/send', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content || content.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        error: 'receiverId and content required'
      });
    }

    try {
      const receiverResult = await pool.query(
        'SELECT city FROM users WHERE id = $1',
        [receiverId]
      );

      if (receiverResult.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Receiver not found' });
      }

      const receiverCity = receiverResult.rows[0].city;
      const senderCity = req.user.city || 'Unknown';

      const deliveryMinutes = calculateDeliveryTime(senderCity, receiverCity);
      const deliveredAt = new Date(Date.now() + deliveryMinutes * 60 * 1000);

      const letterId = uuid();

      // İşlemleri garantiye almak için tek bir sorgu bloğu gibi düşünebiliriz
      // 1. Mektubu Kaydet
      await pool.query(
        `INSERT INTO letters (id, sender_id, receiver_id, content, delivered_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [letterId, senderId, receiverId, content.trim(), deliveredAt]
      );

      // 2. Pul ekle/güncelle (Hata Düzeltildi: stamps."count" ve tablo ismi eklendi)
      const stampTypes = ['vintage', 'modern', 'rare', 'classic'];
      const randomStamp = stampTypes[Math.floor(Math.random() * stampTypes.length)];

      await pool.query(
        `INSERT INTO stamps (user_id, stamp_type, "count")
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, stamp_type) 
         DO UPDATE SET "count" = stamps."count" + 1`,
        [senderId, randomStamp]
      );

      return {
        success: true,
        letter: {
          id: letterId,
          receiverId,
          sentAt: new Date(),
          deliveredAt,
          deliveryMinutes: Math.round(deliveryMinutes)
        }
      };
    } catch (err) {
      console.error('Send letter error:', err.message);
      return reply.status(500).send({ success: false, error: 'Failed to send letter' });
    }
  });

  // GET /letters/inbox (Alınan mektuplar)
  fastify.get('/letters/inbox', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    try {
      const result = await pool.query(
        `SELECT l.id, l.sender_id, l.content, l.read, l.delivered_at, l.created_at,
                u.username, u.avatar_url, u.city, u.country
         FROM letters l
         JOIN users u ON l.sender_id = u.id
         WHERE l.receiver_id = $1 AND l.delivered_at <= NOW()
         ORDER BY l.delivered_at DESC`,
        [userId]
      );
      return { success: true, letters: result.rows };
    } catch (err) {
      console.error('Get inbox error:', err.message);
      return reply.status(500).send({ success: false, error: 'Failed to fetch inbox' });
    }
  });

  // GET /letters/outbox (Gönderilen mektuplar)
  fastify.get('/letters/outbox', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    try {
      const result = await pool.query(
        `SELECT l.id, l.receiver_id, l.content, l.read, l.sent_at, l.delivered_at,
                u.username, u.avatar_url, u.city, u.country
         FROM letters l
         JOIN users u ON l.receiver_id = u.id
         WHERE l.sender_id = $1
         ORDER BY l.sent_at DESC`,
        [userId]
      );
      return { success: true, letters: result.rows };
    } catch (err) {
      console.error('Get outbox error:', err.message);
      return reply.status(500).send({ success: false, error: 'Failed to fetch outbox' });
    }
  });

  // PUT /letters/:id/read (Mektup oku)
  fastify.put('/letters/:id/read', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      await pool.query(
        `UPDATE letters SET read = true WHERE id = $1 AND receiver_id = $2`,
        [id, userId]
      );
      return { success: true };
    } catch (err) {
      console.error('Mark read error:', err.message);
      return reply.status(500).send({ success: false, error: 'Failed to mark as read' });
    }
  });

  // GET /statistics (Kullanıcı istatistikleri)
  fastify.get('/statistics', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    try {
      // Hata Düzeltildi: COALESCE(SUM("count"), 0) tırnak içine alındı
      const stats = await pool.query(
        `SELECT
          (SELECT COUNT(*) FROM letters WHERE sender_id = $1) as sent_count,
          (SELECT COUNT(*) FROM letters WHERE receiver_id = $1) as received_count,
          (SELECT COUNT(*) FROM letters WHERE receiver_id = $1 AND read = true) as read_count,
          (SELECT COUNT(*) FROM friendships WHERE (user_id_1 = $1 OR user_id_2 = $1) AND status = 'accepted') as friends_count,
          (SELECT COALESCE(SUM("count"), 0) FROM stamps WHERE user_id = $1) as total_stamps
        `,
        [userId]
      );
      return { success: true, statistics: stats.rows[0] };
    } catch (err) {
      console.error('Get statistics error:', err.message);
      return reply.status(500).send({ success: false, error: 'Failed to fetch statistics' });
    }
  });

  // GET /stamps (Pul koleksiyonu)
  fastify.get('/stamps', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id;
    try {
      const result = await pool.query(
        'SELECT stamp_type, "count" FROM stamps WHERE user_id = $1 ORDER BY "count" DESC',
        [userId]
      );
      return { success: true, stamps: result.rows };
    } catch (err) {
      console.error('Get stamps error:', err.message);
      return reply.status(500).send({ success: false, error: 'Failed to fetch stamps' });
    }
  });
};