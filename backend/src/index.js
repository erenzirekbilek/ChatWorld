const app = require('./app'); // app.js'den gelen fastify instance'ı
const { initDB } = require('./db');
const { startScheduler } = require('./services/scheluder');

const start = async () => {
  try {
    // 1. Veritabanını hazırla
    await initDB();
    console.log('✅ DB initialized and tables created.');
    
     // 2. Scheduler'ı başlat (gecikmeli mektup teslimi için)
    startScheduler();

    // 3. Sunucuyu başlat
    // 'app' artık bir fastify instance'ı olduğu için .listen hata vermez.
    await app.listen({ 
      port: 3000, 
      host: '0.0.0.0' 
    });

    console.log('🚀 Server running on http://192.168.1.110:3000');
  } catch (err) {
    console.error('❌ Uygulama başlatılamadı:', err);
    process.exit(1);
  }
};

start();