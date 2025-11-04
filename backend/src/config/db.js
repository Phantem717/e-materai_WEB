// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
let pool;
let initializing = false;

async function initDb() {
  if (pool || initializing) return; // avoid duplicate init

  try {
    initializing = true;
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await tempConnection.end();

    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 100,
      enableKeepAlive: true,
  idleTimeout: 30000,            // 30 seconds idle
  queueLimit: 0,               // Prevent infinite queues
  keepAliveInitialDelay: 10000  
    });

    console.log("? MySQL pool initialized");
  } catch (error) {
    console.error("? MySQL init failed:", error);
    throw error;
  } finally {
    initializing = false;
  }
}

async function getDb() {
  if (!pool) {
    await initDb(); // ensure pool is ready before using
  }
  return pool;
}

module.exports = { initDb, getDb };