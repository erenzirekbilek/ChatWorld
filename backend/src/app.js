const fastify = require('fastify')({
  logger: { transport: { target: 'pino-pretty' } },
});

const JWTPlugin = require('@fastify/jwt');
const cors = require('@fastify/cors');
require('dotenv').config();

fastify.register(require('./plugins/errorHandler'));

fastify.register(cors, { origin: '*' });

fastify.register(JWTPlugin, {
  secret: process.env.JWT_SECRET || 'test-secret-key-must-be-at-least-32-chars-long',
});

fastify.register(require('./plugins/security'));

fastify.register(require('./plugins/swagger'));

fastify.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch (_err) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized - Invalid or missing token',
    });
  }
});

fastify.register(require('./routes/auth'), { prefix: '/auth' });

fastify.register(require('./routes/letters'), {
  prefix: '/letters',
});

fastify.register(require('./routes/friendships'), {
  prefix: '/friendships',
});

fastify.register(require('./routes/profile'), {
  prefix: '/profile',
});

fastify.get('/health', async (_req, _reply) => {
  return { status: 'ok' };
});

module.exports = fastify;
