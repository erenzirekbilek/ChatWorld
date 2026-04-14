const app = require('./app');
const { initDB } = require('./db');
const { startScheduler } = require('./services/scheluder');
const { validateEnv } = require('./config/env');

const start = async () => {
  try {
    validateEnv();

    await initDB();
    console.log('✅ DB initialized and tables created.');

    startScheduler();

    await app.listen({
      port: process.env.PORT || 3000,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server running on http://0.0.0.0:${process.env.PORT || 3000}`);
  } catch (err) {
    console.error('❌ Failed to start application:', err.message);
    process.exit(1);
  }
};

start();
