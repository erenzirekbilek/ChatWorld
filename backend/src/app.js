// src/app.js
const Fastify = require("fastify");
const dotenv = require("dotenv");
const { setupErrorHandler } = require("./utils/errors");

dotenv.config();

const fastify = Fastify({
  logger: false,
});

// ===================================
// ERROR HANDLER (Must be before routes!)
// ===================================
setupErrorHandler(fastify);

// ===================================
// AUTHENTICATION DECORATOR
// ===================================
fastify.decorate("authenticate", async function (req, reply) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return reply.code(401).send({ 
        success: false,
        error: "No token provided",
        code: "NO_TOKEN",
        statusCode: 401
      });
    }
    
    // Decode token: format is base64(userId:username:timestamp)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, username] = decoded.split(':');
    
    if (!userId || !username) {
      return reply.code(401).send({ 
        success: false,
        error: "Invalid token format",
        code: "INVALID_TOKEN",
        statusCode: 401
      });
    }
    
    req.user = { id: userId, username };
  } catch (err) {
    reply.code(401).send({ 
      success: false,
      error: "Unauthorized",
      code: "UNAUTHORIZED",
      statusCode: 401
    });
  }
});

// ===================================
// SECURITY PLUGIN
// ===================================
fastify.register(require("./plugins/security"));

// ===================================
// ROUTES WITH PREFIXES
// ===================================
fastify.register(require("./routes/auth"), { prefix: "/auth" });
fastify.register(require("./routes/profile"), { prefix: "/auth" });
fastify.register(require("./routes/letters"), { prefix: "/letters" });
fastify.register(require("./routes/friendships"), { prefix: "/friendships" });

// ===================================
// HEALTH CHECK ENDPOINT
// ===================================
fastify.get("/health", async (req, reply) => {
  return reply.code(200).send({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = fastify;