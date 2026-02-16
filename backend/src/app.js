const fastify = require('fastify')({
  logger: { transport: { target: 'pino-pretty' } }
});

const JWTPlugin = require('@fastify/jwt');
const cors = require('@fastify/cors');
require('dotenv').config();

// ============ PLUGINS ============

// CORS ayarları: Frontend veya Swagger'ın erişebilmesi için
fastify.register(cors, { origin: '*' });

// JWT Konfigürasyonu
fastify.register(JWTPlugin, {
  secret: process.env.JWT_SECRET || 'test-secret-key-must-be-at-least-32-chars-long'
});

// Swagger kaydı (Rotalardan ÖNCE yapılmalı)
fastify.register(require('./plugins/swagger'));

// ============ AUTH DECORATOR ============

// Bu fonksiyon, korumalı rotalara girilmeden önce token kontrolü yapar
fastify.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify(); 
    // Başarılı olursa req.user dolar
  } catch (err) {
    return reply.status(401).send({ 
      success: false, 
      error: 'Unauthorized - Invalid or missing token' 
    });
  }
});

// ============ ROUTES ============

// 1. Korumasız Rotalar (Giriş ve Kayıt herkes için açık)
fastify.register(require('./routes/auth'), { prefix: '/auth' });

// 2. Korumalı Rotalar (her endpoint kendi authenticate'ını kontrol ediyor)
fastify.register(require('./routes/letters'), { 
  prefix: '/letters'
});

fastify.register(require('./routes/friendships'), { 
  prefix: '/friendships'
});

fastify.register(require('./routes/profile'), { 
  prefix: '/profile'
});

// ============ HEALTH CHECK ============

fastify.get('/health', async (req, reply) => {
  return { status: 'ok' };
});

module.exports = fastify;