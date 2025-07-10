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
        await connection.execute(
          `INSERT INTO fleet_monkey_test.dbo_tblexchangerates (currency_code, rate, base_currency, updated_at)
           VALUES (?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE rate = ?, updated_at = NOW()`,
          [currency, rate, baseCurrency, rate]
        );
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
      const [rows] = await connection.execute('SELECT * FROM fleet_monkey_test.dbo_tblexchangerates');
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
}

module.exports = new ExchangeRateModel();