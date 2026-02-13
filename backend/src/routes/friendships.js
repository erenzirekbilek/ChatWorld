const { pool } = require('../db');
const { v4: uuid } = require('uuid');

module.exports = async (fastify) => {
  // POST /friendships/request (Arkadaş istemi gönder)
  fastify.post('/friendships/request', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId1 = req.user.id;
    const { userId2 } = req.body;

    if (!userId2 || userId1 === userId2) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    try {
      const friendshipId = uuid();

      await pool.query(
        `INSERT INTO friendships (id, user_id_1, user_id_2, status)
         VALUES ($1, $2, $3, 'pending')
         ON CONFLICT (user_id_1, user_id_2) DO UPDATE SET status = 'pending'`,
        [friendshipId, userId1, userId2]
      );

      return { success: true, message: 'Friend request sent' };
    } catch (err) {
      console.error('Send friend request error:', err.message);
      return reply.status(500).send({ error: 'Failed to send request' });
    }
  });

  // PUT /friendships/:id/accept (Arkadaş isteğini kabul et)
  fastify.put('/friendships/:id/accept', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      await pool.query(
        `UPDATE friendships SET status = 'accepted'
         WHERE id = $1 AND (user_id_1 = $2 OR user_id_2 = $2)`,
        [id, userId]
      );

      return { success: true };
    } catch (err) {
      return reply.status(500).send({ error: 'Failed to accept request' });
    }
  });

  // GET /friendships (Arkadaş listesi)
  fastify.get('/friendships', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id;

    try {
      const result = await pool.query(
        `SELECT CASE
          WHEN user_id_1 = $1 THEN user_id_2
          ELSE user_id_1
        END as friend_id,
        u.username, u.avatar_url, u.city, u.country
        FROM friendships f
        JOIN users u ON (
          (f.user_id_1 = $1 AND u.id = f.user_id_2) OR
          (f.user_id_2 = $1 AND u.id = f.user_id_1)
        )
        WHERE f.status = 'accepted'`,
        [userId]
      );

      return {
        success: true,
        friends: result.rows
      };
    } catch (err) {
      return reply.status(500).send({ error: 'Failed to fetch friends' });
    }
  });
};