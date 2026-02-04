const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "rafey", // use your real password
  database: "invoice_ai",
});

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected to invoice_ai");
  } catch (err) {
    console.error("❌ PostgreSQL error:", err.message);
  }
})();

module.exports = pool;
