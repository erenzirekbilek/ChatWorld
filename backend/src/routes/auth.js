const { pool } = require('../db');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');

module.exports = async (fastify) => {
  // REGISTER
  fastify.post('/register', async (req, reply) => {
    const { username, email, password } = req.body;
    
    try {
      const hash = await argon2.hash(password);
      const id = uuid();
      
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash) VALUES ($1, $2, $3, $4)',
        [id, username, email, hash]
      );
      
      const token = fastify.jwt.sign({ id, username });
      return { token, user: { id, username, email } };
    } catch (err) {
      reply.status(400).send({ error: err.message });
    }
  });

  // LOGIN
  fastify.post('/login', async (req, reply) => {
    const { email, password } = req.body;
    
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }
    
    const user = res.rows[0];
    const valid = await argon2.verify(user.password_hash, password);
    
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }
    
    const token = fastify.jwt.sign({ id: user.id, username: user.username });
    return { token, user: { id: user.id, username: user.username, email: user.email } };
  });
};