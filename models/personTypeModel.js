const sql = require('mssql');

const personTypeFields = `
    PersonTypeID,
    PersonRole,
    CreateByID,
    CreatedDateTime,
    DeletedDateTime,
    DeletedByID
`;

class PersonTypeModel {
  static async getAllPersonTypes(pool) {
    if (!pool || !pool.connected) {
      throw new Error('Database pool is not connected');
    }
    try {
      const result = await pool.request()
        .query(`SELECT ${personTypeFields} FROM tblPersonType WHERE DeletedDateTime IS NULL`);
      return result.recordset;
    } catch (error) {
      console.error('Error in getAllPersonTypes:', error);
      throw error;
    }
  }

  static async getPersonTypeById(pool, id) {
    if (!pool || !pool.connected) {
      throw new Error('Database pool is not connected');
    }
    try {
      const result = await pool.request()
        .input('PersonTypeID', sql.Int, id)
        .query(`SELECT ${personTypeFields} FROM tblPersonType WHERE PersonTypeID = @PersonTypeID AND DeletedDateTime IS NULL`);
      return result.recordset[0];
    } catch (error) {
      console.error('Error in getPersonTypeById:', error);
      throw error;
    }
  }

  static async createPersonType(pool, personTypeData) {
    if (!pool || !pool.connected) {
      throw new Error('Database pool is not connected');
    }
    try {
      // Required fields validation
      if (!personTypeData.PersonRole) {
        throw new Error('PersonRole is required');
      }

      const result = await pool.request()
        .input('PersonRole', sql.NVarChar(255), personTypeData.PersonRole)
        .input('CreateByID', sql.Int, personTypeData.CreateByID)
        .input('CreatedDateTime', sql.DateTime, new Date())
        .query(`
          INSERT INTO tblPersonType (PersonRole, CreateByID, CreatedDateTime)
          OUTPUT INSERTED.*
          VALUES (@PersonRole, @CreateByID, @CreatedDateTime)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error in createPersonType:', error);
      throw error;
    }
  }

  static async updatePersonType(pool, id, personTypeData) {
    if (!pool || !pool.connected) {
      throw new Error('Database pool is not connected');
    }
    try {
      // Required fields validation
      if (!personTypeData.PersonRole) {
        throw new Error('PersonRole is required');
      }

      const result = await pool.request()
        .input('PersonTypeID', sql.Int, id)
        .input('PersonRole', sql.NVarChar(255), personTypeData.PersonRole)
        .query(`
          UPDATE tblPersonType
          SET PersonRole = @PersonRole
          OUTPUT INSERTED.*
          WHERE PersonTypeID = @PersonTypeID AND DeletedDateTime IS NULL
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error in updatePersonType:', error);
      throw error;
    }
  }

  static async deletePersonType(pool, id, DeletedByID) {
    if (!pool || !pool.connected) {
      throw new Error('Database pool is not connected');
    }
    try {
      if (!DeletedByID) {
        throw new Error('DeletedByID is required');
      }

      const result = await pool.request()
        .input('PersonTypeID', sql.Int, id)
        .input('DeletedByID', sql.Int, DeletedByID)
        .input('DeletedDateTime', sql.DateTime, new Date())
        .query(`
          UPDATE tblPersonType
          SET DeletedDateTime = @DeletedDateTime,
              DeletedByID = @DeletedByID
          OUTPUT INSERTED.*
          WHERE PersonTypeID = @PersonTypeID AND DeletedDateTime IS NULL
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error in deletePersonType:', error);
      throw error;
    }
  }
}

module.exports = PersonTypeModel;