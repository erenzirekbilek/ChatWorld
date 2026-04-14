const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const initDB = async () => {
  const client = await pool.connect();

  try {
    const schemaPath = path.join(__dirname, "..", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await client.query(schema);

    console.log("✅ DB initialized and tables created.");
  } finally {
    client.release();
  }
};

const closeDB = async () => {
  await pool.end();
};

module.exports = {
  pool,
  initDB,
  closeDB,
};
