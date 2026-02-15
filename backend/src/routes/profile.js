const { pool } = require("../db");

module.exports = async function (fastify) {
  // UPDATE PROFILE
  fastify.put("/profile", { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const userId = req.user.id; // From auth decorator
    const { bio } = req.body;

    if (!bio && bio !== null && bio !== undefined) {
      return reply.code(400).send({
        error: "Bio is required",
      });
    }

    // Bio length validation
    if (bio && bio.length > 500) {
      return reply.code(400).send({
        error: "Bio too long",
      });
    }

    try {
      await pool.query(
        `
        UPDATE users
        SET bio=$1
        WHERE id=$2
      `,
        [bio || null, userId]
      );

      return reply.code(200).send({
        success: true,
        message: "Profile updated",
      });
    } catch (err) {
      console.error("Update profile error:", err.message);
      return reply.code(500).send({
        error: "Failed to update profile",
      });
    }
  });
};