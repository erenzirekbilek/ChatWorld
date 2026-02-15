// src/routes/auth.js
const argon2 = require("argon2");
const { pool } = require("../db");
const { v4: uuid } = require("uuid");
const {
  ValidationError,
  NotFoundError,
  InternalError,
  ConflictError
} = require("../utils/errors");

// Simple token generator (for testing - use JWT in production)
const generateToken = (userId, username) => {
  return Buffer.from(`${userId}:${username}:${Date.now()}`).toString('base64');
};

module.exports = async function (fastify) {
  // ===================================
  // POST /auth/register
  // ===================================
  fastify.post("/register", async (req, reply) => {
    const { username, email, password, gender, country, city } = req.body;

    // Validation
    if (!username || username.length < 3 || username.length > 50) {
      throw new ValidationError(
        "Username must be between 3-50 characters",
        "INVALID_USERNAME"
      );
    }

    if (!email || !email.includes("@")) {
      throw new ValidationError(
        "Invalid email format",
        "INVALID_EMAIL"
      );
    }

    if (!password || password.length < 8) {
      throw new ValidationError(
        "Password must be at least 8 characters",
        "WEAK_PASSWORD"
      );
    }

    const validGenders = ["Male", "Female", "Other"];
    if (!gender || !validGenders.includes(gender)) {
      throw new ValidationError(
        `Gender must be one of: ${validGenders.join(", ")}`,
        "INVALID_GENDER"
      );
    }

    if (!country || country.length < 2 || country.length > 100) {
      throw new ValidationError(
        "Country must be between 2-100 characters",
        "INVALID_COUNTRY"
      );
    }

    if (!city || city.length < 2 || city.length > 100) {
      throw new ValidationError(
        "City must be between 2-100 characters",
        "INVALID_CITY"
      );
    }

    try {
      const hash = await argon2.hash(password);
      const id = uuid();

      await pool.query(
        `INSERT INTO users (id, username, email, password_hash, gender, country, city)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, username, email, hash, gender, country, city]
      );

      const token = generateToken(id, username);

      return reply.code(200).send({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id,
          username,
          email,
        },
      });
    } catch (err) {
      if (err.code === "23505") {
        // Unique constraint violation
        if (err.constraint === "users_username_key") {
          throw new ConflictError(
            "Username already exists",
            "USERNAME_EXISTS"
          );
        }
        if (err.constraint === "users_email_key") {
          throw new ConflictError(
            "Email already exists",
            "EMAIL_EXISTS"
          );
        }
      }
      throw new InternalError("Failed to register user");
    }
  });

  // ===================================
  // POST /auth/login
  // ===================================
  fastify.post("/login", async (req, reply) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError(
        "Email and password are required",
        "MISSING_CREDENTIALS"
      );
    }

    try {
      const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        throw new ValidationError(
          "Invalid email or password",
          "INVALID_CREDENTIALS"
        );
      }

      const user = result.rows[0];
      const valid = await argon2.verify(user.password_hash, password);

      if (!valid) {
        throw new ValidationError(
          "Invalid email or password",
          "INVALID_CREDENTIALS"
        );
      }

      const token = generateToken(user.id, user.username);

      return reply.send({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }
      throw new InternalError("Login failed");
    }
  });

  // ===================================
  // GET /auth/profile/:userId
  // ===================================
  fastify.get("/profile/:userId", async (req, reply) => {
    const { userId } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new ValidationError(
        "Invalid user ID format",
        "INVALID_USER_ID"
      );
    }

    try {
      const result = await pool.query(
        `SELECT id, username, email, bio, avatar_url, gender, country, city, created_at 
         FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError("User");
      }

      return reply.code(200).send({
        success: true,
        user: result.rows[0],
      });
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof ValidationError) {
        throw err;
      }
      throw new InternalError("Failed to fetch profile");
    }
  });
};