// src/plugins/security.js
// Rate limiting ve Security Headers plugin
// Kullanım: fastify.register(require('./plugins/security'))

const rateLimit = require('@fastify/rate-limit');
const helmet = require('@fastify/helmet');

module.exports = async (fastify) => {
  // ===================================
  // Rate Limiting
  // ===================================
  await fastify.register(rateLimit, {
    max: 100, // 100 requests
    timeWindow: '15 minutes', // per 15 minutes

    // Endpoint-specific overrides
    cache: 10000, // max number of records to keep in memory
    allowList: ['127.0.0.1'], // don't rate limit localhost (development)
    skip: (request) => {
      // Skip rate limit for health checks
      return request.url === '/health';
    },
    keyGenerator: (request) => {
      // Rate limit by IP (veya user ID if authenticated)
      return request.user?.id || request.ip;
    }
  });

  // Stricter rate limits for auth endpoints
  await fastify.register(rateLimit, {
    max: 5, // 5 attempts
    timeWindow: '15 minutes',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please try again later.'
    })
  }, { prefix: '/auth' });

  // ===================================
  // Security Headers (Helmet)
  // ===================================
  await fastify.register(helmet, {
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  });

  // ===================================
  // Custom Security Headers
  // ===================================
  fastify.addHook('onSend', async (request, reply) => {
    // Prevent MIME type sniffing
    reply.header('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    reply.header('X-XSS-Protection', '1; mode=block');
    
    // Prevent clickjacking
    reply.header('X-Frame-Options', 'DENY');
    
    // Referrer Policy
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  });
};