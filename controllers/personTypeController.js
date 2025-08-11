const sql = require('mssql');
const dbConfig = require('../config/db.config');
const PersonTypeModel = require('../models/personTypeModel');

class PersonTypeController {
  static async getAllPersonTypes(req, res) {
    try {
      const pool = await sql.connect(dbConfig);
      const personTypes = await PersonTypeModel.getAllPersonTypes(pool);

      if (!personTypes || personTypes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No person types found'
        });
      }

      res.status(200).json({
        success: true,
        data: personTypes,
        count: personTypes.length
      });
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  static async getPersonTypeByCode(code) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('code', sql.VarChar(50), code)
        .query('SELECT * FROM PersonTypes WHERE PersonTypeCode = @code');
      return result.recordset[0];
    } catch (err) {
      console.error('Error finding person type by code:', err);
      throw err;
    }
  }

  static async getPersonTypeById(req, res) {
    try {
      if (!req.params.id || isNaN(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Person Type ID'
        });
      }

      const pool = await sql.connect(dbConfig);
      const personType = await PersonTypeModel.getPersonTypeById(pool, req.params.id);

      if (!personType) {
        return res.status(404).json({
          success: false,
          message: 'Person Type not found'
        });
      }

      res.status(200).json({
        success: true,
        data: personType
      });
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  static async createPersonType(req, res) {
    try {
      const data = req.body;

      if (!data.PersonRole) {
        return res.status(400).json({
          success: false,
          message: 'PersonRole is required'
        });
      }

      const pool = await sql.connect(dbConfig);
      const newPersonType = await PersonTypeModel.createPersonType(pool, data);

      res.status(201).json({
        success: true,
        message: 'Person Type created successfully',
        data: newPersonType
      });
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  static async updatePersonType(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Person Type ID'
        });
      }

      if (!data.PersonRole) {
        return res.status(400).json({
          success: false,
          message: 'PersonRole is required'
        });
      }

      const pool = await sql.connect(dbConfig);
      const updatedPersonType = await PersonTypeModel.updatePersonType(pool, id, data);

      if (!updatedPersonType) {
        return res.status(404).json({
          success: false,
          message: 'Person Type not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Person Type updated successfully',
        data: updatedPersonType
      });
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  static async deletePersonType(req, res) {
    try {
      const { id } = req.params;
      const { DeletedByID } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Person Type ID'
        });
      }

      if (!DeletedByID) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required'
        });
      }

      const pool = await sql.connect(dbConfig);
      const deletedPersonType = await PersonTypeModel.deletePersonType(pool, id, DeletedByID);

      if (!deletedPersonType) {
        return res.status(404).json({
          success: false,
          message: 'Person Type not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Person Type deleted successfully',
        data: deletedPersonType
      });
    } catch (err) {
      console.error('SQL error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }
}

module.exports = PersonTypeController;