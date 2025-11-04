// backend_farmasi/src/setupDatabase.js
// src/setupDatabase.js
const { getDb } = require('./config/db');

const queries = [
  `CREATE TABLE IF NOT EXISTS api_responses (
    doc_id VARCHAR(255) NOT NULL PRIMARY KEY,
    serial_number VARCHAR(255),
    document JSON,
    status VARCHAR(255),
    batchId VARCHAR(255),
    procId VARCHAR(255),
    qrImage LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`
];


async function setupDatabase() {
  const pool = await getDb();
  const conn = await pool.getConnection(); // Get explicit connection

  try {
    for (const [i, query] of queries.entries()) {
      await conn.query(query); // Use connection directly
      console.log(`Query ${i + 1} executed`);
    }
  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  } finally {
    conn.release(); // Release instead of ending
    console.log('All connections released');
  }
}

module.exports = { setupDatabase };
