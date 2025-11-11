const { getDb } = require('../config/db');

class Responses {
   static async create(responseData) {
  const pool = await getDb();
  const conn = await pool.getConnection(); // ? Explicit conn

    try {
      const query = `
        INSERT INTO api_responses (
          doc_id,
          serial_number,
          document,
          status,
          batchId,
          procId,
          qrImage
        ) VALUES (?, ?, ?, ?,  ?, ?, ?)
      `;
      const values = [
        responseData.doc_id,
        responseData.serial_number,
        responseData.document,
        responseData.status,
        responseData.batchId,
        responseData.procId,
        responseData.qrImage

      ];
      const [result] = await conn.execute(query, values);
      return result;
    } catch (error) {
      throw error;
    }finally {
    if (conn) conn.release(); // only release if we created it
  }
  }

  static async findByDocId(docId){
     const pool = await getDb();
  const conn = await pool.getConnection(); // ? Explicit conn

    try {
      const query = `
        SELECT * From api_responses
        WHERE doc_id = ?
        order by doc_id desc;
      `;
      
      
      const [result] = await conn.execute(query,[docId]);
      return result;
    } catch (error) {
      throw error;
    }finally {
    if (conn) conn.release(); // only release if we created it
  }
  }

static async findSerialNumberByDocId(docName) {
  const pool = await getDb();
  const conn = await pool.getConnection();

  try {
    // Convert `-` to `_` to normalize the format
    const normalized = docName.replace(/-/g, "_");

    const query = `
      SELECT serial_number 
      FROM api_responses
      WHERE doc_id LIKE CONCAT('%', ?, '%')
      LIMIT 1;
    `;

    const [result] = await conn.execute(query, [normalized]);
    return result;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}


  static async getAll(){
     const pool = await getDb();
  const conn = await pool.getConnection(); // ? Explicit conn

    try {
      const query = `
        SELECT * From api_responses;
      `;
      
      const [result] = await conn.execute(query);
      return result;
    } catch (error) {
      throw error;
    }finally {
    if (conn) conn.release(); // only release if we created it
  }
  }

  static async deleteInstance(docId){
  const pool = await getDb();
  const conn = await pool.getConnection(); // ? Explicit conn

    try {
      const query = `
        Delete From api_responses
        WHERE doc_id = ?
      `;
      
      
      const [result] = await conn.execute(query,[docId]);
      return result;
    } catch (error) {
      throw error;
    }finally {
    if (conn) conn.release(); // only release if we created it
  }
  }


}

module.exports = Responses;