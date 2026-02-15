// src/app.js

const fastify = require('fastify')({
  logger: { transport: { target: 'pino-pretty' } }
});

const JWTPlugin = require('@fastify/jwt');
const cors = require('@fastify/cors');
require('dotenv').config();

// ============ PLUGINS ============

fastify.register(cors, { origin: '*' });

fastify.register(JWTPlugin, {
  secret: process.env.JWT_SECRET || 'test-secret'
});

// Swagger MUST be registered FIRST before routes
fastify.register(require('./plugins/swagger'));

// ============ AUTH DECORATOR ============

fastify.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.status(401).send({ success: false, error: 'Unauthorized' });
  }
});

// ============ ROUTES (registered AFTER swagger) ============

fastify.register(require('./routes/auth'), { prefix: '/auth' });
fastify.register(require('./routes/letters'), { prefix: '/letters' });
fastify.register(require('./routes/friendships'), { prefix: '/friendships' });

// ============ HEALTH CHECK ============

fastify.get('/health', {
  schema: {
    tags: ['Health'],
    description: 'Health check endpoint',
    response: {
      200: {
        description: 'Server is healthy',
        type: 'object',
        properties: {
          status: { type: 'string' }
        }
      }
    }
  }
}, async (req, reply) => {
  return { status: 'ok' };
});

module.exports = fastify;