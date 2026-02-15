const Fastify = require("fastify");
const dotenv = require("dotenv");

dotenv.config();

const fastify = Fastify({
  logger: false,
});

// AUTHENTICATION DECORATOR
fastify.decorate("authenticate", async function (req, reply) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return reply.code(401).send({ error: "No token provided" });
    }
    
    // Decode token: format is base64(userId:username:timestamp)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, username] = decoded.split(':');
    
    if (!userId || !username) {
      return reply.code(401).send({ error: "Invalid token format" });
    }
    
    req.user = { id: userId, username };
  } catch (err) {
    reply.code(401).send({ error: "Unauthorized" });
  }
});

// ROUTES WITH PREFIXES
fastify.register(require("./routes/auth"), { prefix: "/auth" });
fastify.register(require("./routes/profile"), { prefix: "/auth" });
fastify.register(require("./routes/letters"), { prefix: "/letters" });
fastify.register(require("./routes/friendships"), { prefix: "/friendships" });

module.exports = fastify;