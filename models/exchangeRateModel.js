const poolPromise = require('../config/db.config');

class ExchangeRateModel {
  static async populateCurrencies(currencies, createdById = 1) {
    try {
      const pool = await poolPromise;
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        for (const currency of currencies) {
          const [existing] = await connection.query(
            'SELECT CurrencyID FROM dbo_tblcurrency1 WHERE CurrencyName = ? AND IsDeleted = 0',
            [currency.CurrencyName]
          );

          if (!existing.length) {
            await connection.query(
              'INSERT INTO dbo_tblcurrency1 (CurrencyName, CreatedByID) VALUES (?, ?)',
              [currency.CurrencyName, createdById]
            );
          }
        }

        await connection.commit();
        return { message: 'Currencies populated successfully' };
      } catch (err) {
        await connection.rollback();
        throw new Error(`Database error: ${err.message}`);
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('populateCurrencies error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

static async storeExchangeRate(fromCurrencyId, toCurrencyId, rate, date) {
  try {
    const pool = await poolPromise;

    if (!Number.isInteger(Number(fromCurrencyId)) || fromCurrencyId <= 0) {
      throw new Error('Invalid FromCurrencyID');
    }
    if (!Number.isInteger(Number(toCurrencyId)) || toCurrencyId <= 0) {
      throw new Error('Invalid ToCurrencyID');
    }
    if (!rate || isNaN(parseFloat(rate))) {
      throw new Error('Invalid ExchangeRate');
    }
    if (!date || isNaN(new Date(date))) {
      throw new Error('Invalid ExchangeRatesDate');
    }

    const query = `
      INSERT INTO dbo_tblexchangerates (FromCurrencyID, ToCurrencyID, ExchangeRatesDate, ExchangeRate)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE ExchangeRate = ?, ExchangeRatesID = LAST_INSERT_ID(ExchangeRatesID)
    `;
    const params = [fromCurrencyId, toCurrencyId, date, parseFloat(rate), parseFloat(rate)];

    const [result] = await pool.query(query, params);
    return {
      exchangeRateId: result.insertId || (await pool.query('SELECT LAST_INSERT_ID() AS id')[0][0].id),
      message: 'Exchange rate stored or updated successfully',
    };
  } catch (err) {
    console.error('storeExchangeRate error:', err);
    throw new Error(`Database error: ${err.message}`);
  }
}

  static async getExchangeRate(fromCurrencyId, toCurrencyId, date = new Date().toISOString().slice(0, 10)) {
    try {
      const pool = await poolPromise;

      if (!Number.isInteger(Number(fromCurrencyId)) || fromCurrencyId <= 0) {
        throw new Error('Invalid FromCurrencyID');
      }
      if (!Number.isInteger(Number(toCurrencyId)) || toCurrencyId <= 0) {
        throw new Error('Invalid ToCurrencyID');
      }
      if (!date || isNaN(new Date(date))) {
        throw new Error('Invalid ExchangeRatesDate');
      }

      const [results] = await pool.query(
        'SELECT ExchangeRate, ExchangeRatesDate FROM dbo_tblexchangerates WHERE FromCurrencyID = ? AND ToCurrencyID = ? AND ExchangeRatesDate = ?',
        [fromCurrencyId, toCurrencyId, date]
      );

      if (!results.length) {
        throw new Error('Exchange rate not found for the specified currency pair and date');
      }

      return results[0];
    } catch (err) {
      console.error('getExchangeRate error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async getAllCurrencies() {
    try {
      const pool = await poolPromise;
      const [results] = await pool.query(
        'SELECT CurrencyID, CurrencyName FROM dbo_tblcurrency1 WHERE IsDeleted = 0'
      );
      return results;
    } catch (err) {
      console.error('getAllCurrencies error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = ExchangeRateModel;