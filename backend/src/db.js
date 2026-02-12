const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
// 1. ADIM: .env dosyasını okuması için en üste ekliyoruz
require('dotenv').config(); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 2. ADIM: Neon ve diğer bulut servisleri SSL olmadan bağlantıya izin vermez
  ssl: {
    rejectUnauthorized: false 
  }
});

const initDB = async () => {
  try {
    // 3. ADIM: Hata almamak için dosya yolunu 'path' ile sağlama alıyoruz
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(sql);
    console.log('✅ DB initialized and tables created.');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    // Hata durumunda uygulamanın kilitlenmemesi için hatayı yukarı fırlatıyoruz
    throw err;
  }
};

module.exports = { pool, initDB };