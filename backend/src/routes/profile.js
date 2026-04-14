// src/routes/profile.js

const { pool } = require("../db");

module.exports = async function (fastify) {
  
  // ⚠️ ÖNEMLI: Static routes ÖNCE, dynamic routes SONRA!
  // /discover ve / routes'ları ÖNCE tanımla

  // 1. TÜM KULLANICILARI BUL (DISCOVER) - FİLTRELEME İLE
  fastify.get(
    "/discover",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Profile"],
        description: "Discover all users with optional filters",
        security: [{ Bearer: [] }],
        querystring: {
          type: "object",
          properties: {
            country: { type: "string" },
            city: { type: "string" },
            gender: { type: "string" },
            username: { type: "string" }
          }
        },
        response: {
          200: {
            description: "Users discovered successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              users: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    username: { type: "string" },
                    bio: { type: "string" },
                    gender: { type: "string" },
                    country: { type: "string" },
                    city: { type: "string" },
                    avatar_url: { type: "string" },
                    interests: { type: "string" }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthorized - Invalid or missing token",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" }
            }
          }
        }
      }
    },
    async (req, reply) => {
      try {
        const currentUserId = req.user.id;
        const { country, city, gender, username } = req.query;

        // SQL sorgusu dinamik olarak oluştur
        let query = `
          SELECT id, username, bio, gender, country, city, avatar_url, interests
          FROM users 
          WHERE id != $1
        `;
        
        const params = [currentUserId];
        let paramIndex = 2;

        // Filtreleri dinamik olarak ekle
        if (country && country !== "All") {
          query += ` AND country = $${paramIndex}`;
          params.push(country);
          paramIndex++;
        }

        if (city && city !== "All") {
          query += ` AND city = $${paramIndex}`;
          params.push(city);
          paramIndex++;
        }

        if (gender && gender !== "All") {
          query += ` AND gender = $${paramIndex}`;
          params.push(gender);
          paramIndex++;
        }

        if (username) {
          query += ` AND username ILIKE $${paramIndex}`;
          params.push(`%${username}%`);
          paramIndex++;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);

        return reply.code(200).send({
          success: true,
          users: result.rows
        });
      } catch (err) {
        console.error("Discover error:", err.message);
        return reply.code(500).send({ 
          success: false,
          error: "Failed to discover users" 
        });
      }
    }
  );

  // 3. PROFİL GÜNCELLE (PUT / route)
  fastify.put(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Profile"],
        description: "Update user profile",
        security: [{ Bearer: [] }],
        body: {
          type: "object",
          properties: {
            bio: { type: ["string", "null"], maxLength: 500 },
            avatar_url: { type: ["string", "null"] },
            interests: { type: ["string", "null"], maxLength: 200 }
          }
        },
        response: {
          200: {
            description: "Profile updated",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" }
            }
          },
          400: {
            description: "Invalid input",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" }
            }
          },
          401: {
            description: "Unauthorized - Invalid or missing token",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" }
            }
          }
        }
      }
    },
    async (req, reply) => {
      const userId = req.user.id;
      const { bio, avatar_url, interests } = req.body || {};

      // Hiçbir alan gelmemişse hata dön
      if (bio === undefined && avatar_url === undefined && interests === undefined) {
        return reply.code(400).send({ 
          success: false,
          error: "No fields to update" 
        });
      }

      // Validasyon
      if (bio && bio.length > 500) {
        return reply.code(400).send({ 
          success: false,
          error: "Bio must NOT have more than 500 characters" 
        });
      }

      if (interests && interests.length > 200) {
        return reply.code(400).send({ 
          success: false,
          error: "Interests must NOT have more than 200 characters" 
        });
      }

      try {
        // Dinamik update
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (bio !== undefined) {
          updates.push(`bio = $${paramIndex}`);
          params.push(bio || null);
          paramIndex++;
        }

        if (avatar_url !== undefined) {
          updates.push(`avatar_url = $${paramIndex}`);
          params.push(avatar_url || null);
          paramIndex++;
        }

        if (interests !== undefined) {
          updates.push(`interests = $${paramIndex}`);
          params.push(interests || null);
          paramIndex++;
        }

        params.push(userId);

        const query = `
          UPDATE users 
          SET ${updates.join(", ")}
          WHERE id = $${paramIndex}
          RETURNING id, username, email, bio, gender, country, city, avatar_url, interests
        `;

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
          return reply.code(404).send({ 
            success: false,
            error: "User not found" 
          });
        }

        return reply.code(200).send({
          success: true,
          message: "Profile updated successfully",
          user: result.rows[0]
        });
      } catch (err) {
        console.error("Update profile error:", err.message);
        return reply.code(500).send({ 
          success: false,
          error: "Failed to update profile" 
        });
      }
    }
  );

  // 2. BELİRLİ BİR PROFİLİ GETİR (/:id route - SONRA!)
  fastify.get(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Profile"],
        description: "Get user profile by ID",
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "User ID" }
          },
          required: ["id"]
        },
        response: {
          200: {
            description: "Profile retrieved",
            type: "object",
            properties: {
              success: { type: "boolean" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  username: { type: "string" },
                  bio: { type: "string" },
                  gender: { type: "string" },
                  country: { type: "string" },
                  city: { type: "string" },
                  avatar_url: { type: "string" },
                  interests: { type: "string" }
                }
              }
            }
          },
          401: {
            description: "Unauthorized - Invalid or missing token",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" }
            }
          },
          404: {
            description: "User not found",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" }
            }
          }
        }
      }
    },
    async (req, reply) => {
      const { id } = req.params;
      try {
        const result = await pool.query(
          `SELECT id, username, bio, gender, country, city, avatar_url, interests
           FROM users 
           WHERE id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ 
            success: false,
            error: "User not found" 
          });
        }

        return reply.code(200).send({
          success: true,
          user: result.rows[0]
        });
      } catch (err) {
        console.error("Get profile error:", err.message);
        return reply.code(500).send({ 
          success: false,
          error: "Failed to fetch profile" 
        });
      }
    }
  );
};