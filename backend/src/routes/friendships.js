// src/routes/friendships.js
const { pool } = require('../db');
const { v4: uuid } = require('uuid');

module.exports = async (fastify) => {
  // ===================================
  // POST /friendships/request
  // Arkadaş isteği gönder
  // ===================================
  fastify.post('/request', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId1 = req.user.id;
    const { userId2 } = req.body;

    // Validation
    if (!userId2) {
      return reply.status(400).send({ 
        error: 'userId2 is required' 
      });
    }

    if (userId1 === userId2) {
      return reply.status(400).send({ 
        error: 'Cannot send friend request to yourself' 
      });
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId2)) {
      return reply.status(400).send({ 
        error: 'Invalid userId format' 
      });
    }

    try {
      // Check if recipient exists
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [userId2]
      );

      if (userCheck.rows.length === 0) {
        return reply.status(404).send({ 
          error: 'User not found' 
        });
      }

      // Order IDs to prevent duplicates (smaller ID first)
      const [smaller, larger] = [userId1, userId2].sort();
      const friendshipId = uuid();

      // Insert or update (if already exists, mark as pending again)
      const result = await pool.query(
        `INSERT INTO friendships (id, user_id_1, user_id_2, status, created_at)
         VALUES ($1, $2, $3, 'pending', NOW())
         ON CONFLICT (user_id_1, user_id_2) 
         DO UPDATE SET status = 'pending', created_at = NOW()
         RETURNING id, status, created_at`,
        [friendshipId, smaller, larger]
      );

      return reply.status(201).send({
        success: true,
        message: 'Friend request sent',
        friendship: result.rows[0]
      });
    } catch (err) {
      console.error('Send friend request error:', err.message);
      return reply.status(500).send({ 
        error: 'Failed to send friend request' 
      });
    }
  });

  // ===================================
  // PUT /friendships/:id/accept
  // Arkadaş isteğini kabul et
  // ===================================
  fastify.put('/:id/accept', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user.id;

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return reply.status(400).send({ 
        error: 'Invalid friendship ID format' 
      });
    }

    try {
      // Check friendship exists and user is part of it
      const friendCheck = await pool.query(
        `SELECT id, user_id_1, user_id_2, status FROM friendships WHERE id = $1`,
        [id]
      );

      if (friendCheck.rows.length === 0) {
        return reply.status(404).send({ 
          error: 'Friendship request not found' 
        });
      }

      const { user_id_1, user_id_2, status } = friendCheck.rows[0];

      // Check if user is part of this friendship
      if (userId !== user_id_1 && userId !== user_id_2) {
        return reply.status(403).send({ 
          error: 'Cannot accept this friend request' 
        });
      }

      // Can only accept pending requests
      if (status !== 'pending') {
        return reply.status(400).send({ 
          error: `Cannot accept request with status: ${status}` 
        });
      }

      // Update status
      const result = await pool.query(
        `UPDATE friendships 
         SET status = 'accepted' 
         WHERE id = $1
         RETURNING id, status, created_at as accepted_at`,
        [id]
      );

      return reply.status(200).send({
        success: true,
        message: 'Friend request accepted',
        friendship: result.rows[0]
      });
    } catch (err) {
      console.error('Accept friendship error:', err.message);
      return reply.status(500).send({ 
        error: 'Failed to accept friend request' 
      });
    }
  });

  // ===================================
  // PUT /friendships/:id/reject
  // Arkadaş isteğini reddet
  // ===================================
  fastify.put('/:id/reject', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return reply.status(400).send({ 
        error: 'Invalid friendship ID format' 
      });
    }

    try {
      const friendCheck = await pool.query(
        `SELECT id, user_id_1, user_id_2, status FROM friendships WHERE id = $1`,
        [id]
      );

      if (friendCheck.rows.length === 0) {
        return reply.status(404).send({ 
          error: 'Friendship request not found' 
        });
      }

      const { user_id_1, user_id_2, status } = friendCheck.rows[0];

      if (userId !== user_id_1 && userId !== user_id_2) {
        return reply.status(403).send({ 
          error: 'Cannot reject this friend request' 
        });
      }

      if (status !== 'pending') {
        return reply.status(400).send({ 
          error: `Cannot reject request with status: ${status}` 
        });
      }

      // Delete the friendship request
      await pool.query('DELETE FROM friendships WHERE id = $1', [id]);

      return reply.status(200).send({
        success: true,
        message: 'Friend request rejected'
      });
    } catch (err) {
      console.error('Reject friendship error:', err.message);
      return reply.status(500).send({ 
        error: 'Failed to reject friend request' 
      });
    }
  });

  // ===================================
  // DELETE /friendships/:id
  // Arkadaşlığı sonlandır (unfriend)
  // ===================================
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return reply.status(400).send({ 
        error: 'Invalid friendship ID format' 
      });
    }

    try {
      const friendCheck = await pool.query(
        `SELECT id, user_id_1, user_id_2, status FROM friendships WHERE id = $1`,
        [id]
      );

      if (friendCheck.rows.length === 0) {
        return reply.status(404).send({ 
          error: 'Friendship not found' 
        });
      }

      const { user_id_1, user_id_2 } = friendCheck.rows[0];

      if (userId !== user_id_1 && userId !== user_id_2) {
        return reply.status(403).send({ 
          error: 'Cannot delete this friendship' 
        });
      }

      // Delete friendship
      await pool.query('DELETE FROM friendships WHERE id = $1', [id]);

      return reply.status(200).send({
        success: true,
        message: 'Friendship removed'
      });
    } catch (err) {
      console.error('Delete friendship error:', err.message);
      return reply.status(500).send({ 
        error: 'Failed to delete friendship' 
      });
    }
  });

  // ===================================
  // PUT /friendships/:id/block
  // Kullanıcıyı engelle
  // ===================================
  fastify.put('/:id/block', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return reply.status(400).send({ 
        error: 'Invalid friendship ID format' 
      });
    }

    try {
      const friendCheck = await pool.query(
        `SELECT id, user_id_1, user_id_2 FROM friendships WHERE id = $1`,
        [id]
      );

      if (friendCheck.rows.length === 0) {
        return reply.status(404).send({ 
          error: 'Friendship not found' 
        });
      }

      const { user_id_1, user_id_2 } = friendCheck.rows[0];

      if (userId !== user_id_1 && userId !== user_id_2) {
        return reply.status(403).send({ 
          error: 'Cannot block this friendship' 
        });
      }

      // Update status to blocked
      const result = await pool.query(
        `UPDATE friendships 
         SET status = 'blocked' 
         WHERE id = $1
         RETURNING id, status`,
        [id]
      );

      return reply.status(200).send({
        success: true,
        message: 'User blocked',
        friendship: result.rows[0]
      });
    } catch (err) {
      console.error('Block user error:', err.message);
      return reply.status(500).send({ 
        error: 'Failed to block user' 
      });
    }
  });

  // ===================================
  // GET /friendships
  // Tüm arkadaşları getir (sadece accepted)
  // ===================================
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id;

    try {
      const result = await pool.query(
        `SELECT 
          CASE
            WHEN user_id_1 = $1 THEN user_id_2
            ELSE user_id_1
          END as friend_id,
          u.username, 
          u.avatar_url, 
          u.city, 
          u.country,
          u.bio,
          f.created_at as accepted_at
        FROM friendships f
        JOIN users u ON (
          (f.user_id_1 = $1 AND u.id = f.user_id_2) OR
          (f.user_id_2 = $1 AND u.id = f.user_id_1)
        )
        WHERE f.status = 'accepted'
        AND (f.user_id_1 = $1 OR f.user_id_2 = $1)
        ORDER BY f.created_at DESC`,
        [userId]
      );

      return reply.status(200).send({
        success: true,
        friends: result.rows,
        count: result.rows.length
      });
    } catch (err) {
      console.error('Get friendships error:', err.message);
      return reply.status(500).send({ 
        error: 'Failed to fetch friends' 
      });
    }
  });

  // ===================================
  // GET /friendships/pending
  // Bekleyen arkadaş isteklerini getir
  // ===================================
  fastify.get('/pending', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id;

    try {
      const result = await pool.query(
        `SELECT 
          f.id,
          f.user_id_1,
          f.user_id_2,
          f.status,
          f.created_at,
          CASE
            WHEN f.user_id_1 = $1 THEN u2.id
            ELSE u1.id
          END as other_user_id,
          CASE
            WHEN f.user_id_1 = $1 THEN u2.username
            ELSE u1.username
          END as other_username,
          CASE
            WHEN f.user_id_1 = $1 THEN u2.avatar_url
            ELSE u1.avatar_url
          END as other_avatar_url,
          CASE
            WHEN f.user_id_1 = $1 THEN 'received'
            ELSE 'sent'
          END as request_type
        FROM friendships f
        LEFT JOIN users u1 ON f.user_id_1 = u1.id
        LEFT JOIN users u2 ON f.user_id_2 = u2.id
        WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1)
        AND f.status = 'pending'
        ORDER BY f.created_at DESC`,
        [userId]
      );

      return reply.status(200).send({
        success: true,
        pending_requests: result.rows,
        count: result.rows.length
      });
    } catch (err) {
      console.error('Get pending requests error:', err.message);
      return reply.status(500).send({ 
        error: 'Failed to fetch pending requests' 
      });
    }
  });
};