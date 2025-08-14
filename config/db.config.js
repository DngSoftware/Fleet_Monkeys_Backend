// require('dotenv').config();
// const mysql = require('mysql2/promise');

// console.log('mysql2/promise module:', mysql);
// console.log('mysql.createPool:', mysql.createPool);

// const dbConfig = {
//   host: '13.202.8.138',
//   user: 'fleetmonkeys',
//   password: 'Fleet_Monkey@Dnginc#21',
//   database: 'fleet_monkey_test',
//   port: 3306,
//   connectionLimit: 20, // Increased for better concurrency
//   queueLimit: 0,
//   connectTimeout: 30000,
//   waitForConnections: true,
//   multipleStatements: true,
// };

// console.log('dbConfig:', dbConfig);

// if (!dbConfig.user || !dbConfig.password || !dbConfig.host || !dbConfig.database) {
//   throw new Error('Database configuration is missing required credentials');
// }

// if (!mysql.createPool || typeof mysql.createPool !== 'function') {
//   throw new Error('mysql2/promise module is not loaded correctly. Ensure mysql2 is installed and imported as mysql2/promise.');
// }

// let poolPromise;
// try {
//   const pool = mysql.createPool(dbConfig);
//   console.log('pool:', pool);

//   poolPromise = Promise.resolve(pool)
//     .then(async pool => {
//       console.log('Connected to MySQL');
//       try {
//         await pool.query('SET SESSION innodb_lock_wait_timeout = 100');
//         const [rows] = await pool.query('SELECT 1 AS test');
//         console.log('MySQL pool test query result:', rows);
//         return pool;
//       } catch (err) {
//         console.error('MySQL pool test query failed:', err);
//         throw err;
//       }
//     })
//     .catch(err => {
//       console.error('Database connection failed:', err);
//       throw err;
//     });
// } catch (err) {
//   console.error('Error creating MySQL pool:', err);
//   throw err;
// }

// module.exports = poolPromise;





// const mysql = require('mysql2/promise');
// const fs = require('fs');

// // Use private IP or Elastic IP of the database EC2 instance
// const dbConfig = {
//   host: '13.202.8.138', // Replace with the private IP of the database EC2 instance (e.g., 172.31.x.x) or Elastic IP
//   user: 'fleetmonkeys',
//   password: 'Fleet_Monkey@Dnginc#21',
//   database: 'fleet_monkey',
//   port: 3306,
//   connectionLimit: 20, // Reduced for t3.small to avoid overloading
//   queueLimit: 0,
//   connectTimeout: 60000, // Increased to handle potential network latency
//   waitForConnections: true,
//   multipleStatements: true,
//   ssl: process.env.DB_SSL === 'true' ? { // Enable SSL if configured
//     ca: fs.readFileSync('/path/to/mysql-ca-cert.pem') // Path to MySQL CA certificate
//   } : null
// };

// if (!dbConfig.user || !dbConfig.password || !dbConfig.host || !dbConfig.database) {
//   throw new Error('Database configuration is missing required credentials');
// }

// if (!mysql.createPool || typeof mysql.createPool !== 'function') {
//   throw new Error('mysql2/promise module is not loaded correctly.');
// }

// let poolPromise;
// try {
//   const pool = mysql.createPool(dbConfig);
//   poolPromise = Promise.resolve(pool)
//     .then(async pool => {
//       console.log('Connected to MySQL');
//       try {
//         await pool.query('SET SESSION innodb_lock_wait_timeout = 100');
//         const [rows] = await pool.query('SELECT 1 AS test');
//         console.log('MySQL pool test query result:', rows);
//         // Log active connections from MySQL server
//         const [status] = await pool.query('SHOW STATUS WHERE `variable_name` = "Threads_connected"');
//         console.log('Current MySQL connections:', status[0].Value);
//         return pool;
//       } catch (err) {
//         console.error('MySQL pool test query failed:', err.message, err.stack);
//         throw err;
//       }
//     })
//     .catch(err => {
//       console.error('Database connection failed:', err.message, err.stack);
//       throw err;
//     });
// } catch (err) {
//   console.error('Error creating MySQL pool:', err.message, err.stack);
//   throw err;
// }

// module.exports = poolPromise;


require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('mysql2/promise module:', mysql);
console.log('mysql.createPool:', mysql.createPool);

const dbConfig = {
  host: '13.202.8.138',
  user: 'fleetmonkeys',
  password: 'Fleet_Monkey@Dnginc#21',
  database: 'fleet_monkey',
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