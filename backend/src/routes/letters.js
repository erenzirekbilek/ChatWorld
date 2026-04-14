const { pool } = require("../db");
const { v4: uuid } = require("uuid");

module.exports = async function (fastify) {
  // SEND LETTER
  fastify.post(
    "/send",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Letters"],
        description: "Send a letter to another user",
        security: [{ Bearer: [] }],
        body: {
          type: "object",
          required: ["receiverId", "content"],
          properties: {
            receiverId: { type: "string", description: "User ID of recipient" },
            content: { type: "string", description: "Letter content" }
          }
        },
        response: {
          201: {
            description: "Letter sent successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              letter: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  sender_id: { type: "string" },
                  receiver_id: { type: "string" },
                  content: { type: "string" },
                  read: { type: "boolean" }
                }
              }
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
          }
        }
      }
    },
    async (req, reply) => {
      const senderId = req.user.id; // From auth
      const { receiverId, content } = req.body;

      if (!receiverId || !content) {
        return reply.code(400).send({
          success: false,
          error: "Missing fields: receiverId and content required",
        });
      }

      const id = uuid();

      try {
        await pool.query(
          `
          INSERT INTO letters (id, sender_id, receiver_id, content, read)
          VALUES ($1,$2,$3,$4,false)
        `,
          [id, senderId, receiverId, content]
        );

        return reply.code(201).send({
          success: true,
          letter: {
            id,
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            read: false,
          },
        });
      } catch (err) {
        console.error("Send letter error:", err.message);
        return reply.code(500).send({
          success: false,
          error: "Failed to send letter",
        });
      }
    }
  );

  // GET INBOX
  fastify.get(
    "/inbox",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Letters"],
        description: "Get all letters in user's inbox",
        security: [{ Bearer: [] }],
        response: {
          200: {
            description: "Letters retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              letters: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    sender_id: { type: "string" },
                    receiver_id: { type: "string" },
                    content: { type: "string" },
                    read: { type: "boolean" },
                    created_at: { type: "string" }
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
      const userId = req.user.id;

      try {
        const result = await pool.query(
          `
          SELECT *
          FROM letters
          WHERE receiver_id=$1
          ORDER BY created_at DESC
        `,
          [userId]
        );

        return reply.code(200).send({
          success: true,
          letters: result.rows,
        });
      } catch (err) {
        console.error("Get inbox error:", err.message);
        return reply.code(500).send({
          success: false,
          error: "Failed to fetch inbox",
        });
      }
    }
  );

  // MARK AS READ
  fastify.put(
    "/:letterId/read",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Letters"],
        description: "Mark a letter as read",
        security: [{ Bearer: [] }],
        params: {
          type: "object",
          required: ["letterId"],
          properties: {
            letterId: { type: "string", description: "Letter ID" }
          }
        },
        response: {
          200: {
            description: "Letter marked as read",
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
          }
        }
      }
    },
    async (req, reply) => {
      const { letterId } = req.params;

      try {
        await pool.query(
          `
          UPDATE letters
          SET read=true
          WHERE id=$1
        `,
          [letterId]
        );

        return reply.code(200).send({
          success: true,
          message: "Letter marked as read",
        });
      } catch (err) {
        console.error("Mark as read error:", err.message);
        return reply.code(500).send({
          success: false,
          error: "Failed to update letter",
        });
      }
    }
  );
};