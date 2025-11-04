const { getDb } = require('../config/db');

class Responses {
   static async create(responseData,conn = null) {
  const pool = await getDb();
  const connection = conn || await pool.getConnection(); // ? Explicit connection

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
      const [result] = await connection.execute(query, values);
      return result;
    } catch (error) {
      throw error;
    }finally {
    if (!conn) connection.release(); // only release if we created it
  }
  }

  static async findByDocId(docId){
     const pool = await getDb();
  const connection = conn || await pool.getConnection(); // ? Explicit connection

    try {
      const query = `
        SELECT * From api_responses
        WHERE doc_id = ?
        order by doc_id desc;
      `;
      
      
      const [result] = await connection.execute(query,[docId]);
      return result;
    } catch (error) {
      throw error;
    }finally {
    if (!conn) connection.release(); // only release if we created it
  }
  }

  static async getAll(){
     const pool = await getDb();
  const connection = conn || await pool.getConnection(); // ? Explicit connection

    try {
      const query = `
        SELECT * From api_responses;
      `;
      
      const [result] = await connection.execute(query);
      return result;
    } catch (error) {
      throw error;
    }finally {
    if (!conn) connection.release(); // only release if we created it
  }
  }

  static async deleteInstance(docId){
  const pool = await getDb();
  const connection = conn || await pool.getConnection(); // ? Explicit connection

    try {
      const query = `
        Delete From api_responses
        WHERE doc_id = ?
      `;
      
      
      const [result] = await connection.execute(query,[docId]);
      return result;
    } catch (error) {
      throw error;
    }finally {
    if (!conn) connection.release(); // only release if we created it
  }
  }


}

module.exports = Responses;