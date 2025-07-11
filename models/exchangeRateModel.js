const poolPromise = require('../config/db.config');

class ExchangeRateModel {
  async updateRates(rates, baseCurrency) {
    if (!rates || typeof rates !== 'object') {
      throw new Error('Invalid rates data provided');
    }

    const pool = await poolPromise;
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      for (const [currency, rate] of Object.entries(rates)) {
        console.log(`Processing currency: ${currency}, rate: ${rate}`);
        
        // First, try to update existing record
        const [updateResult] = await connection.execute(
          `UPDATE dbo_tblexchangerates 
           SET rate = ?, updated_at = NOW() 
           WHERE currency_code = ? AND base_currency = ?`,
          [rate, currency, baseCurrency]
        );

        // If no rows were affected, insert new record
        if (updateResult.affectedRows === 0) {
          await connection.execute(
            `INSERT INTO dbo_tblexchangerates (currency_code, rate, base_currency, updated_at)
             VALUES (?, ?, ?, NOW())`,
            [currency, rate, baseCurrency]
          );
          console.log(`Inserted new rate for ${currency}: ${rate}`);
        } else {
          console.log(`Updated existing rate for ${currency}: ${rate}`);
        }
      }

      await connection.commit();
      console.log('Exchange rates updated successfully');
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('updateRates error:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw new Error(`Database error: ${error.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  async getRates() {
    const pool = await poolPromise;
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM dbo_tblexchangerates ORDER BY currency_code');
      return rows;
    } catch (error) {
      console.error('getRates error:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw new Error(`Database error: ${error.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  // Alternative method using ON DUPLICATE KEY UPDATE (if you have a unique constraint)
  async updateRatesWithUpsert(rates, baseCurrency) {
    if (!rates || typeof rates !== 'object') {
      throw new Error('Invalid rates data provided');
    }

    const pool = await poolPromise;
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      for (const [currency, rate] of Object.entries(rates)) {
        console.log(`Processing currency: ${currency}, rate: ${rate}`);
        
        await connection.execute(
          `INSERT INTO dbo_tblexchangerates (currency_code, rate, base_currency, updated_at)
           VALUES (?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE 
           rate = VALUES(rate), 
           updated_at = NOW()`,
          [currency, rate, baseCurrency]
        );
      }

      await connection.commit();
      console.log('Exchange rates updated successfully using upsert');
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('updateRatesWithUpsert error:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw new Error(`Database error: ${error.message}`);
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = new ExchangeRateModel();