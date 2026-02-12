const { pool } = require('../db');
const { v4: uuid } = require('uuid');

module.exports = async (fastify) => {
  // GET /rooms (tüm odalar)
  fastify.get('/rooms', async (req, reply) => {
    const res = await pool.query('SELECT * FROM rooms');
    return res.rows;
  });

  // POST /rooms (oda oluştur)
  fastify.post('/rooms', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { name } = req.body;
    const userId = req.user.id;
    const roomId = uuid();
    
    await pool.query(
      'INSERT INTO rooms (id, name, created_by) VALUES ($1, $2, $3)',
      [roomId, name, userId]
    );
    
    // Creator'u room'a ekle
    await pool.query(
      'INSERT INTO room_members (id, room_id, user_id) VALUES ($1, $2, $3)',
      [uuid(), roomId, userId]
    );
    
    return { id: roomId, name };
  });

  // POST /rooms/:id/join (odaya katıl)
  fastify.post('/rooms/:id/join', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
      await pool.query(
        'INSERT INTO room_members (id, room_id, user_id) VALUES ($1, $2, $3)',
        [uuid(), id, userId]
      );
      return { success: true };
    } catch (err) {
      return reply.status(400).send({ error: 'Already joined' });
    }
  });

  // GET /messages/:roomId (son 50 mesaj)
  fastify.get('/messages/:roomId', async (req, reply) => {
    const { roomId } = req.params;
    const res = await pool.query(
      `SELECT m.*, u.username FROM messages m 
       JOIN users u ON m.user_id = u.id 
       WHERE m.room_id = $1 
       ORDER BY m.created_at DESC LIMIT 50`,
      [roomId]
    );
    return res.rows.reverse(); // Eski->Yeni sırası
  });
};