// src/routes/friendships.js
const { pool } = require('../db');
const { v4: uuid } = require('uuid');
const {
  ValidationError,
  AuthorizationError,
  NotFoundError,
  InternalError
} = require('../utils/errors');

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Helper function to validate UUID
const validateUUID = (value, fieldName = 'ID') => {
  if (!value || !UUID_REGEX.test(value)) {
    throw new ValidationError(
      `Invalid ${fieldName} format`,
      `INVALID_${fieldName.toUpperCase()}_FORMAT`
    );
  }
};

module.exports = async (fastify) => {
  
  // ⚠️ ÖNEMLI: Static routes ÖNCE, dynamic routes SONRA!
  // /request ve /pending routes'ları ÖNCE tanımla

  // ===================================
  // POST /friendships/request
  // Arkadaş isteği gönder
  // ===================================
  fastify.post(
    '/request',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Friendships"],
        description: "Send a friend request to another user",
        security: [{ Bearer: [] }],
        body: {
          type: "object",
          required: ["userId2"],
          properties: {
            userId2: { type: "string", description: "User ID to send friend request to" }
          }
        },
        response: {
          201: {
            description: "Friend request sent",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              friendship: { type: "object" }
            }
          },
          400: {
            description: "Bad request",
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
      const userId1 = req.user.id;
      const { userId2 } = req.body;

      // Validation
      if (!userId2) {
        throw new ValidationError(
          'userId2 is required',
          'MISSING_USER_ID'
        );
      }

      validateUUID(userId2, 'userId');

      if (userId1 === userId2) {
        throw new ValidationError(
          'Cannot send friend request to yourself',
          'SELF_REQUEST'
        );
      }

      try {
        // Check if recipient exists
        const userCheck = await pool.query(
          'SELECT id FROM users WHERE id = $1',
          [userId2]
        );

        if (userCheck.rows.length === 0) {
          throw new NotFoundError('User');
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
        if (err instanceof ValidationError || err instanceof NotFoundError) {
          throw err;
        }
        throw new InternalError('Failed to send friend request');
      }
    }
  );

  // ===================================
  // GET /friendships/pending
  // Bekleyen arkadaş isteklerini getir
  // ===================================
  fastify.get(
    '/pending',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Friendships"],
        description: "Get pending friend requests",
        security: [{ Bearer: [] }],
        response: {
          200: {
            description: "Pending requests retrieved",
            type: "object",
            properties: {
              success: { type: "boolean" },
              pending_requests: { type: "array" },
              count: { type: "integer" }
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
        throw new InternalError('Failed to fetch pending requests');
      }
    }
  );

  // ===================================
  // GET /friendships
  // Tüm arkadaşları getir (sadece accepted)
  // ===================================
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Friendships"],
        description: "Get all accepted friends",
        security: [{ Bearer: [] }],
        response: {
          200: {
            description: "Friends list retrieved",
            type: "object",
            properties: {
              success: { type: "boolean" },
              friends: { type: "array" },
              count: { type: "integer" }
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
        throw new InternalError('Failed to fetch friends');
      }
    }
  );

  // ===================================
  // PUT /friendships/:id/accept
  // Arkadaş isteğini kabul et
  // ===================================
  fastify.put(
    '/:id/accept',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Friendships"],
        description: "Accept a friend request",
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", description: "Friendship ID" }
          }
        },
        response: {
          200: {
            description: "Friend request accepted",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              friendship: { type: "object" }
            }
          },
          400: {
            description: "Bad request",
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
          },
          403: {
            description: "Forbidden",
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
      const userId = req.user.id;

      validateUUID(id, 'friendshipId');

      try {
        // Check friendship exists and user is part of it
        const friendCheck = await pool.query(
          `SELECT id, user_id_1, user_id_2, status FROM friendships WHERE id = $1`,
          [id]
        );

        if (friendCheck.rows.length === 0) {
          throw new NotFoundError('Friendship');
        }

        const { user_id_1, user_id_2, status } = friendCheck.rows[0];

        // Check if user is part of this friendship
        if (userId !== user_id_1 && userId !== user_id_2) {
          throw new AuthorizationError(
            'Cannot accept this friend request',
            'ACCESS_DENIED'
          );
        }

        // Can only accept pending requests
        if (status !== 'pending') {
          throw new ValidationError(
            `Cannot accept request with status: ${status}`,
            'INVALID_STATUS'
          );
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
        if (err instanceof ValidationError || err instanceof AuthorizationError || err instanceof NotFoundError) {
          throw err;
        }
        throw new InternalError('Failed to accept friend request');
      }
    }
  );

  // ===================================
  // PUT /friendships/:id/reject
  // Arkadaş isteğini reddet
  // ===================================
  fastify.put(
    '/:id/reject',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Friendships"],
        description: "Reject a friend request",
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", description: "Friendship ID" }
          }
        },
        response: {
          200: {
            description: "Friend request rejected",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" }
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
          403: {
            description: "Forbidden",
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
      const userId = req.user.id;

      validateUUID(id, 'friendshipId');

      try {
        const friendCheck = await pool.query(
          `SELECT id, user_id_1, user_id_2, status FROM friendships WHERE id = $1`,
          [id]
        );

        if (friendCheck.rows.length === 0) {
          throw new NotFoundError('Friendship');
        }

        const { user_id_1, user_id_2, status } = friendCheck.rows[0];

        if (userId !== user_id_1 && userId !== user_id_2) {
          throw new AuthorizationError(
            'Cannot reject this friend request',
            'ACCESS_DENIED'
          );
        }

        if (status !== 'pending') {
          throw new ValidationError(
            `Cannot reject request with status: ${status}`,
            'INVALID_STATUS'
          );
        }

        // Delete the friendship request
        await pool.query('DELETE FROM friendships WHERE id = $1', [id]);

        return reply.status(200).send({
          success: true,
          message: 'Friend request rejected'
        });
      } catch (err) {
        if (err instanceof ValidationError || err instanceof AuthorizationError || err instanceof NotFoundError) {
          throw err;
        }
        throw new InternalError('Failed to reject friend request');
      }
    }
  );

  // ===================================
  // DELETE /friendships/:id
  // Arkadaşlığı sonlandır (unfriend)
  // ===================================
  fastify.delete(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Friendships"],
        description: "Delete/unfriend a user",
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", description: "Friendship ID" }
          }
        },
        response: {
          200: {
            description: "Friendship removed",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" }
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
          403: {
            description: "Forbidden",
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
      const userId = req.user.id;

      validateUUID(id, 'friendshipId');

      try {
        const friendCheck = await pool.query(
          `SELECT id, user_id_1, user_id_2, status FROM friendships WHERE id = $1`,
          [id]
        );

        if (friendCheck.rows.length === 0) {
          throw new NotFoundError('Friendship');
        }

        const { user_id_1, user_id_2 } = friendCheck.rows[0];

        if (userId !== user_id_1 && userId !== user_id_2) {
          throw new AuthorizationError(
            'Cannot delete this friendship',
            'ACCESS_DENIED'
          );
        }

        // Delete friendship
        await pool.query('DELETE FROM friendships WHERE id = $1', [id]);

        return reply.status(200).send({
          success: true,
          message: 'Friendship removed'
        });
      } catch (err) {
        if (err instanceof ValidationError || err instanceof AuthorizationError || err instanceof NotFoundError) {
          throw err;
        }
        throw new InternalError('Failed to delete friendship');
      }
    }
  );

  // ===================================
  // PUT /friendships/:id/block
  // Kullanıcıyı engelle
  // ===================================
  fastify.put(
    '/:id/block',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Friendships"],
        description: "Block a user",
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", description: "Friendship ID" }
          }
        },
        response: {
          200: {
            description: "User blocked",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              friendship: { type: "object" }
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
          403: {
            description: "Forbidden",
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
      const userId = req.user.id;

      validateUUID(id, 'friendshipId');

      try {
        const friendCheck = await pool.query(
          `SELECT id, user_id_1, user_id_2 FROM friendships WHERE id = $1`,
          [id]
        );

        if (friendCheck.rows.length === 0) {
          throw new NotFoundError('Friendship');
        }

        const { user_id_1, user_id_2 } = friendCheck.rows[0];

        if (userId !== user_id_1 && userId !== user_id_2) {
          throw new AuthorizationError(
            'Cannot block this friendship',
            'ACCESS_DENIED'
          );
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
        if (err instanceof ValidationError || err instanceof AuthorizationError || err instanceof NotFoundError) {
          throw err;
        }
        throw new InternalError('Failed to block user');
      }
    }
  );
};