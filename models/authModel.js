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

  static async checkExistingUser(LoginID, EmailID, excludePersonID = null) {
    const pool = await poolPromise;
    let query = `
      SELECT PersonID 
      FROM dbo_tblperson 
      WHERE (LoginID = ? OR EmailID = ?) AND IsDeleted = 0
    `;
    const params = [LoginID?.trim(), EmailID?.trim()];
    if (excludePersonID) {
      query += ` AND PersonID != ?`;
      params.push(parseInt(excludePersonID));
    }
    const [rows] = await pool.query(query, params);
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
      SELECT 
        p.PersonID, 
        p.FirstName, 
        p.MiddleName, 
        p.LastName, 
        p.RoleID, 
        p.Status, 
        p.Salutation, 
        p.Designation, 
        p.Gender, 
        p.DOB, 
        p.JoiningDate, 
        p.CompanyID, 
        p.IsExternal, 
        p.LoginID, 
        p.Password, 
        p.EmailID, 
        p.Is_Dark_Mode, 
        p.ProfileImage, 
        p.CreatedByID, 
        p.CreatedDateTime, 
        p.IsDeleted, 
        p.DeletedDateTime, 
        p.DeletedByID, 
        p.RowVersionColumn,
        r.RoleName,
        c.CompanyName
      FROM dbo_tblperson p 
      LEFT JOIN dbo_tblroles r ON p.RoleID = r.RoleID
      LEFT JOIN dbo_tblcompany c ON p.CompanyID = c.CompanyID
      WHERE p.LoginID = ? AND p.IsDeleted = 0;
    `;
    const [rows] = await pool.query(query, [LoginID?.trim()]);
    return rows[0];
  }

  static async getUserByPersonID(PersonID) {
    const pool = await poolPromise;
    const query = `
      SELECT 
        p.PersonID, 
        p.FirstName, 
        p.MiddleName, 
        p.LastName, 
        p.RoleID, 
        p.Status, 
        p.Salutation, 
        p.Designation, 
        p.Gender, 
        p.DOB, 
        p.JoiningDate, 
        p.CompanyID, 
        p.IsExternal, 
        p.LoginID, 
        p.Password, 
        p.EmailID, 
        p.Is_Dark_Mode, 
        p.ProfileImage, 
        p.CreatedByID, 
        p.CreatedDateTime, 
        p.IsDeleted, 
        p.DeletedDateTime, 
        p.DeletedByID, 
        p.RowVersionColumn,
        r.RoleName,
        c.CompanyName
      FROM dbo_tblperson p 
      LEFT JOIN dbo_tblroles r ON p.RoleID = r.RoleID
      LEFT JOIN dbo_tblcompany c ON p.CompanyID = c.CompanyID
      WHERE p.PersonID = ? AND p.IsDeleted = 0;
    `;
    const [rows] = await pool.query(query, [parseInt(PersonID)]);
    return rows[0];
  }

  static async updateUserProfile(PersonID, userData) {
    const pool = await poolPromise;

    // Validate LoginID and EmailID uniqueness (excluding the current user)
    if (userData.LoginID || userData.EmailID) {
      const userExists = await this.checkExistingUser(
        userData.LoginID || null,
        userData.EmailID || null,
        PersonID
      );
      if (userExists) {
        throw new Error('LoginID or EmailID already exists');
      }
    }

    // Build dynamic query to update only provided fields
    const fields = [];
    const values = [];
    const allowedFields = [
      'FirstName', 'MiddleName', 'LastName', 'EmailID', 'LoginID', 'Password',
      'Salutation', 'Designation', 'Gender', 'DOB', 'JoiningDate', 
      'Is_Dark_Mode', 'ProfileImage'
    ];

    if (userData.FirstName) {
      fields.push('FirstName = ?');
      values.push(userData.FirstName.trim());
    }
    if (userData.MiddleName !== undefined) {
      fields.push('MiddleName = ?');
      values.push(userData.MiddleName?.trim() || null);
    }
    if (userData.LastName) {
      fields.push('LastName = ?');
      values.push(userData.LastName.trim());
    }
    if (userData.EmailID) {
      fields.push('EmailID = ?');
      values.push(userData.EmailID.trim());
    }
    if (userData.LoginID) {
      fields.push('LoginID = ?');
      values.push(userData.LoginID.trim());
    }
    if (userData.Password) {
      fields.push('Password = ?');
      values.push(await bcrypt.hash(userData.Password.trim(), 12));
    }
    if (userData.Salutation) {
      fields.push('Salutation = ?');
      values.push(userData.Salutation.trim());
    }
    if (userData.Designation) {
      fields.push('Designation = ?');
      values.push(userData.Designation.trim());
    }
    if (userData.Gender) {
      fields.push('Gender = ?');
      values.push(userData.Gender.trim());
    }
    if (userData.DOB) {
      fields.push('DOB = ?');
      values.push(userData.DOB);
    }
    if (userData.JoiningDate) {
      fields.push('JoiningDate = ?');
      values.push(userData.JoiningDate);
    }
    if (userData.Is_Dark_Mode !== undefined) {
      fields.push('Is_Dark_Mode = ?');
      values.push(userData.Is_Dark_Mode ? 1 : 0);
    }
    if (userData.ProfileImage) {
      fields.push('ProfileImage = ?');
      values.push(userData.ProfileImage.trim());
    }

    // Always increment RowVersionColumn
    fields.push('RowVersionColumn = RowVersionColumn + 1');

    if (fields.length === 1) { // Only RowVersionColumn
      throw new Error('No valid fields provided for update');
    }

    const query = `
      UPDATE dbo_tblperson 
      SET ${fields.join(', ')}
      WHERE PersonID = ? AND IsDeleted = 0;
    `;
    values.push(parseInt(PersonID));

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      throw new Error('User not found or already deleted');
    }

    // Fetch updated user details
    const updatedUser = await this.getUserByPersonID(PersonID);
    return updatedUser;
  }

  static async blacklistToken(token, expiry) {
    const pool = await poolPromise;
    const query = `
      INSERT INTO dbo_tbltokenblacklist (Token, ExpiryDateTime)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE ExpiryDateTime = ?;
    `;
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