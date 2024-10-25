require("dotenv").config();
const db = require("./config/database");

async function testConnection() {
  try {
    const result = await db.query("SELECT NOW()");
    console.log(
      "Database connection successful. Current time:",
      result.rows[0].now
    );
  } catch (err) {
    console.error("Error connecting to the database:", err);
  } finally {
    process.exit();
  }
}

testConnection();
