const fastify = require('fastify')({
  logger: {
    transport: { target: 'pino-pretty' }
  }
});

const SocketIO = require('fastify-socket.io');
const JWTPlugin = require('@fastify/jwt');
const cors = require('@fastify/cors');

// Plugins
fastify.register(cors, { origin: '*' });
fastify.register(JWTPlugin, {
  secret: process.env.JWT_SECRET || 'test-secret'
});
fastify.register(SocketIO, {
  cors: { origin: '*' }
});

// Auth decorator
fastify.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Routes
fastify.register(require('./routes/auth'));
fastify.register(require('./routes/letters'));
fastify.register(require('./routes/friendships'));

// Health check
fastify.get('/health', async (req, reply) => {
  return { status: 'ok' };
});

module.exports = fastify;