const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

class ExchangeRateModel {
  async getConnection() {
    return await mysql.createConnection(dbConfig);
  }

  async createTable() {
    const connection = await this.getConnection();
    try {
      // First, check if the table exists
      const [tables] = await connection.execute(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'dbo_tblexchangerates' AND TABLE_SCHEMA = ?", 
        [dbConfig.database]
      );
      
      // If table exists, drop it to ensure correct schema
      if (tables.length > 0) {
        await connection.execute('DROP TABLE dbo_tblexchangerates');
        console.log('Dropped existing exchange rates table to recreate with correct schema');
      }
      
      // Create the table with the correct schema
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS dbo_tblexchangerates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          currency_code VARCHAR(3) NOT NULL,
          rate DECIMAL(10, 4) NOT NULL,
          base_currency VARCHAR(3) NOT NULL,
          updated_at DATETIME NOT NULL
        )
      `);
      console.log('Exchange rates table created/verified successfully');
    } finally {
      await connection.end();
    }
  }

  async updateRates(rates, baseCurrency) {
    if (!rates || typeof rates !== 'object') {
      throw new Error('Invalid rates data provided');
    }
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      for (const [currency, rate] of Object.entries(rates)) {
        await connection.execute(
          `INSERT INTO dbo_tblexchangerates (currency_code, rate, base_currency, updated_at)
           VALUES (?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE rate = ?, updated_at = NOW()`,
          [currency, rate, baseCurrency, rate]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  }

  async getRates() {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM dbo_tblexchangerates');
      return rows;
    } finally {
      await connection.end();
    }
  }
}

module.exports = new ExchangeRateModel();