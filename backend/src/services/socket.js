const { pool } = require('../db');
const { v4: uuid } = require('uuid');

module.exports = (fastify) => {
  fastify.io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;
    
    // JWT Doğrula
    try {
      const decoded = fastify.jwt.verify(token);
      socket.userId = decoded.id;
      socket.username = decoded.username;
      console.log(`✅ ${socket.username} connected`);
    } catch (err) {
      socket.emit('connect_error', { message: 'Invalid token' });
      socket.disconnect();
      return;
    }

    // Odaya katıl
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`${socket.username} joined room ${roomId}`);
      fastify.io.to(roomId).emit('userJoined', {
        username: socket.username,
        timestamp: new Date()
      });
    });

    // Mesaj gönder
    socket.on('sendMessage', async (data) => {
      const { roomId, content } = data;
      const msgId = uuid();

      try {
        // DB'ye kaydet
        await pool.query(
          'INSERT INTO messages (id, room_id, user_id, content) VALUES ($1, $2, $3, $4)',
          [msgId, roomId, socket.userId, content]
        );

        // Odaya broadcast et
        fastify.io.to(roomId).emit('message', {
          id: msgId,
          username: socket.username,
          content,
          timestamp: new Date()
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ ${socket.username} disconnected`);
    });
  });
};