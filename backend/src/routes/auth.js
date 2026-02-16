// src/routes/auth.js

const { pool } = require('../db');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 100;
};

const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(password);
};

const validateUsername = (username) => {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
};

module.exports = async (fastify) => {
  // POST /auth/register
  fastify.post('/register', {
    schema: {
      tags: ['Authentication'],
      description: 'Register new user',
      body: {
        type: 'object',
        required: ['username', 'email', 'password', 'gender', 'country', 'city'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 30 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
          country: { type: 'string' },
          city: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Registration successful',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        },
        409: {
          description: 'User already exists',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username, email, password, gender, country, city } = req.body;

    if (!validateUsername(username)) {
      return reply.status(400).send({
        success: false,
        error: 'Username: 3-30 chars (alphanumeric, underscore only)'
      });
    }

    if (!validateEmail(email)) {
      return reply.status(400).send({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    if (!validatePassword(password)) {
      return reply.status(400).send({
        success: false,
        error: 'Password: 8+ chars with 1 uppercase, 1 lowercase, 1 number'
      });
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return reply.status(400).send({
        success: false,
        error: 'Gender must be Male, Female, or Other'
      });
    }

    if (!country || country.length === 0 || country.length > 100) {
      return reply.status(400).send({
        success: false,
        error: 'Country: 1-100 characters'
      });
    }

    if (!city || city.length === 0 || city.length > 100) {
      return reply.status(400).send({
        success: false,
        error: 'City: 1-100 characters'
      });
    }

    try {
      const existing = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existing.rows.length > 0) {
        return reply.status(409).send({
          success: false,
          error: 'Username or email already exists'
        });
      }

      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1
      });

      const userId = uuid();

      await pool.query(
        `INSERT INTO users (id, username, email, password_hash, gender, country, city)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, username, email, passwordHash, gender, country, city]
      );

      const token = fastify.jwt.sign(
        { id: userId, username, email },
        { expiresIn: '30d' }
      );

      return reply.status(200).send({
        success: true,
        token,
        user: { id: userId, username, email }
      });
    } catch (err) {
      console.error('Register error:', err.message);

      if (err.code === '23505') {
        return reply.status(409).send({
          success: false,
          error: 'Username or email already exists'
        });
      }

      return reply.status(500).send({ 
        success: false,
        error: 'Registration failed' 
      });
    }
  });

  // POST /auth/login
  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      description: 'Login and get JWT token',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        },
        400: {
          description: 'Missing fields',
          type: 'object',
          properties: { 
            success: { type: 'boolean' },
            error: { type: 'string' } 
          }
        },
        401: {
          description: 'Invalid credentials',
          type: 'object',
          properties: { 
            success: { type: 'boolean' },
            error: { type: 'string' } 
          }
        }
      }
    }
  }, async (req, reply) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return reply.status(400).send({
        success: false,
        error: 'Email and password required'
      });
    }

    try {
      const result = await pool.query(
        'SELECT id, username, email, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return reply.status(401).send({ 
          success: false,
          error: 'Invalid email or password' 
        });
      }

      const user = result.rows[0];
      const passwordValid = await argon2.verify(user.password_hash, password);

      if (!passwordValid) {
        return reply.status(401).send({ 
          success: false,
          error: 'Invalid email or password' 
        });
      }

      const token = fastify.jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        { expiresIn: '30d' }
      );

      return reply.status(200).send({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      console.error('Login error:', err.message);
      return reply.status(500).send({ 
        success: false,
        error: 'Login failed' 
      });
    }
  });
};