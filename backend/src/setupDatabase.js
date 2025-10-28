const { getDb } = require('./config/db');
const queries= [];
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