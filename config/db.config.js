require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('mysql2/promise module:', mysql);
console.log('mysql.createPool:', mysql.createPool);

const dbConfig = {
  host: '13.202.8.138',
  user: 'fleetmonkeys',
  password: 'Fleet_Monkey@Dnginc#21',
  database: 'fleet_monkey_test',
  port: 3306,
  connectionLimit: 50, // Increased for better concurrency
  queueLimit: 0,
  connectTimeout: 30000,
  waitForConnections: true,
  multipleStatements: true
};

console.log('dbConfig:', dbConfig);

if (!dbConfig.user || !dbConfig.password || !dbConfig.host || !dbConfig.database) {
  throw new Error('Database configuration is missing required credentials');
}

if (!mysql.createPool || typeof mysql.createPool !== 'function') {
  throw new Error('mysql2/promise module is not loaded correctly. Ensure mysql2 is installed and imported as mysql2/promise.');
}

let poolPromise;
try {
  const pool = mysql.createPool(dbConfig);
  console.log('pool:', pool);

  poolPromise = Promise.resolve(pool)
    .then(async pool => {
      console.log('Connected to MySQL');
      try {
        await pool.query('SET SESSION innodb_lock_wait_timeout = 100');
        const [rows] = await pool.query('SELECT 1 AS test');
        console.log('MySQL pool test query result:', rows);
        return pool;
      } catch (err) {
        console.error('MySQL pool test query failed:', err);
        throw err;
      }
    })
    .catch(err => {
      console.error('Database connection failed:', err);
      throw err;
    });
} catch (err) {
  console.error('Error creating MySQL pool:', err);
  throw err;
}

module.exports = poolPromise;