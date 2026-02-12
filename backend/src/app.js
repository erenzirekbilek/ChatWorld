const fastifyLib = require('fastify');
const SocketIO = require('fastify-socket.io');
const JWTPlugin = require('@fastify/jwt');

// Fastify v5 için en temiz logger yapılandırması
const app = fastifyLib({ 
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
});

app.register(JWTPlugin, { secret: process.env.JWT_SECRET || 'super-secret' });
app.register(SocketIO, { cors: { origin: '*' } });

// JWT doğrulama fonksiyonunu Fastify'a tanıtıyoruz
app.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify(); // Token geçerli mi diye bakar
  } catch (err) {
    reply.send(err); // Geçersizse hata fırlatır
  }
});
// Routes
app.register(require('./routes/auth'));
app.register(require('./routes/rooms'));

module.exports = app;