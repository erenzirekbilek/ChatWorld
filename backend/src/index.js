const app = require('./app');
const { initDB } = require('./db');
const socketHandler = require('./services/socket');
const start = async () => {
  try {
    // Önce veritabanını ve tabloları hazırla
    await initDB(); 
    await app.register(socketHandler);
    // Veritabanı başarıyla bağlandıysa sunucuyu başlat
    // Not: Eğer Express kullanıyorsan app.listen(3000, ...) şeklinde yazmalısın.
    // Eğer Fastify kullanıyorsan aşağıdaki format doğrudur:
    await app.listen({ port: 3000, host: '0.0.0.0' });
    
    console.log('🚀 Server running on http://localhost:3000');
  } catch (err) {
    console.error('❌ Uygulama başlatılamadı:', err);
    process.exit(1); // Kritik hata durumunda süreci durdur
  }
};

start().catch(console.error);