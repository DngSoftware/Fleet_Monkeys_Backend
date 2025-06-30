const mysql = require('mysql2/promise');
const poolPromise = require('../config/db.config');
const bcrypt = require('bcryptjs');

class User {
  static async createUser(userData, CreatedByID) {
    const pool = await poolPromise;
    const query = `
      INSERT INTO dbo_tblperson (
        FirstName, MiddleName, LastName, EmailID, LoginID, Password, RoleID, CompanyID,
        CreatedByID, CreatedDateTime, IsDeleted
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0
      );
      SELECT LAST_INSERT_ID() AS PersonID;
    `;

    const values = [
      userData.FirstName?.trim(),
      userData.MiddleName?.trim() || null,
      userData.LastName?.trim(),
      userData.EmailID?.trim(),
      userData.LoginID?.trim(),
      userData.Password,
      parseInt(userData.RoleID),
      parseInt(userData.CompanyID),
      parseInt(CreatedByID)
    ];

    const [results] = await pool.query(query, values);
    const insertedId = results[1][0].PersonID;
    return insertedId;
  }

  static async getRoleById(RoleID) {
    const pool = await poolPromise;
    const query = `
      SELECT RoleID, RoleName 
      FROM dbo_tblroles 
      WHERE RoleID = ? AND IsDeleted = 0;
    `;
    const [rows] = await pool.query(query, [parseInt(RoleID)]);
    return rows[0];
  }

  static async getCompanyById(CompanyID) {
    const pool = await poolPromise;
    const query = `
      SELECT CompanyID, CompanyName 
      FROM dbo_tblcompany 
      WHERE CompanyID = ? AND IsDeleted = 0;
    `;
    const [rows] = await pool.query(query, [parseInt(CompanyID)]);
    return rows[0];
  }

  static async checkExistingUser(LoginID, EmailID) {
    const pool = await poolPromise;
    const query = `
      SELECT PersonID 
      FROM dbo_tblperson 
      WHERE (LoginID = ? OR EmailID = ?) AND IsDeleted = 0;
    `;
    const [rows] = await pool.query(query, [LoginID?.trim(), EmailID?.trim()]);
    return rows.length > 0;
  }

  static async getAdmins() {
    const pool = await poolPromise;
    const query = `
      SELECT p.PersonID, p.LoginID, p.EmailID 
      FROM dbo_tblperson p 
      INNER JOIN dbo_tblroles r ON p.RoleID = r.RoleID 
      WHERE r.RoleName IN ('Administrator', 'Admin') AND p.IsDeleted = 0;
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async getUserByLoginID(LoginID) {
    const pool = await poolPromise;
    const query = `
      SELECT p.PersonID, p.LoginID, p.Password, p.RoleID, r.RoleName
      FROM dbo_tblperson p 
      JOIN dbo_tblroles r ON p.RoleID = r.RoleID
      WHERE p.LoginID = ? AND p.IsDeleted = 0;
    `;
    const [rows] = await pool.query(query, [LoginID?.trim()]);
    return rows[0];
  }

  static async getUserByPersonID(PersonID) {
    const pool = await poolPromise;
    const query = `
      SELECT p.PersonID, p.LoginID, p.Password, p.RoleID, r.RoleName
      FROM dbo_tblperson p 
      JOIN dbo_tblroles r ON p.RoleID = r.RoleID
      WHERE p.PersonID = ? AND p.IsDeleted = 0;
    `;
    const [rows] = await pool.query(query, [parseInt(PersonID)]);
    return rows[0];
  }

  static async blacklistToken(token, expiry) {
    const pool = await poolPromise;
    const query = `
      INSERT INTO dbo_tbltokenblacklist (Token, ExpiryDateTime)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE ExpiryDateTime = ?;
    `;
    // Ensure expiry is in UTC for consistency
    const expiryUTC = expiry.toISOString().replace('T', ' ').split('.')[0];
    console.log('Storing token in blacklist with expiry (UTC):', expiryUTC);
    await pool.query(query, [token, expiryUTC, expiryUTC]);
  }

  static async isTokenBlacklisted(token) {
    const pool = await poolPromise;
    const query = `
      SELECT Token
      FROM dbo_tbltokenblacklist
      WHERE Token = ? AND ExpiryDateTime > UTC_TIMESTAMP();
    `;
    const [rows] = await pool.query(query, [token]);
    return rows.length > 0;
  }

  static async cleanExpiredTokens() {
    const pool = await poolPromise;
    const query = `
      DELETE FROM dbo_tbltokenblacklist
      WHERE ExpiryDateTime <= UTC_TIMESTAMP();
    `;
    await pool.query(query);
  }
}

module.exports = User;