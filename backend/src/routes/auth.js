const argon2 = require("argon2");
const { pool } = require("../db");
const { v4: uuid } = require("uuid");

// Simple token generator (for testing - use JWT in production)
const generateToken = (userId, username) => {
  return Buffer.from(`${userId}:${username}:${Date.now()}`).toString('base64');
};

module.exports = async function (fastify) {
  // REGISTER
  fastify.post("/register", async (req, reply) => {
    const { username, email, password, gender, country, city } = req.body;

    if (!username || username.length < 3) {
      return reply.code(400).send({
        error: "Invalid username",
      });
    }

    if (!email || !password) {
      return reply.code(400).send({
        error: "Email and password required",
      });
    }

    if (!gender || !country || !city) {
      return reply.code(400).send({
        error: "Gender, country, and city are required",
      });
    }

    const hash = await argon2.hash(password);
    const id = uuid();

    try {
      await pool.query(
        `
        INSERT INTO users (id, username, email, password_hash, gender, country, city)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
        [id, username, email, hash, gender, country, city]
      );

      // Generate token
      const token = generateToken(id, username);

      return reply.code(200).send({
        success: true,
        token,
        user: {
          id,
          username,
          email,
        },
      });
    } catch (err) {
      console.error("Register error:", err.message);
      return reply.code(400).send({
        error: "User already exists or invalid data",
      });
    }
  });

  // LOGIN
  fastify.post("/login", async (req, reply) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return reply.code(400).send({
        error: "Email and password required",
      });
    }

    try {
      const result = await pool.query(
        `SELECT * FROM users WHERE email=$1`,
        [email]
      );

      if (result.rows.length === 0) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const user = result.rows[0];

      const valid = await argon2.verify(user.password_hash, password);

      if (!valid) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user.id, user.username);

      return reply.send({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (err) {
      console.error("Login error:", err.message);
      return reply.code(500).send({ error: "Login failed" });
    }
  });

  // GET PROFILE
  fastify.get("/profile/:userId", async (req, reply) => {
    const { userId } = req.params;

    try {
      const result = await pool.query(
        `SELECT id, username, email, bio, avatar_url, gender, country, city FROM users WHERE id=$1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: "User not found" });
      }

      return reply.code(200).send({
        success: true,
        user: result.rows[0],
      });
    } catch (err) {
      console.error("Get profile error:", err.message);
      return reply.code(500).send({ error: "Failed to fetch profile" });
    }
  });
};