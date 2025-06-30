const TaxChargesTypeModel = require('../models/taxChargesTypeModel');

class TaxChargesTypeController {
  // Get all Tax Charge Types with pagination
  static async getAllTaxChargesTypes(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      const taxChargesTypes = await TaxChargesTypeModel.getAllTaxChargesTypes({
        pageNumber: parseInt(pageNumber),
        pageSize: parseInt(pageSize),
        fromDate,
        toDate
      });

      return res.status(200).json({
        success: true,
        message: 'Tax charge types retrieved successfully',
        data: taxChargesTypes.data,
        totalRecords: taxChargesTypes.totalRecords
      });
    } catch (err) {
      console.error('getAllTaxChargesTypes error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        taxChargesTypeId: null
      });
    }
  }

  // Create a new Tax Charge Type
  static async createTaxChargesType(req, res) {
    try {
      const { taxChargesType, defaultCharges, createdById } = req.body;

      // Basic validation
      if (!taxChargesType || defaultCharges == null || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'TaxChargesType, DefaultCharges, and CreatedByID are required',
          data: null,
          taxChargesTypeId: null
        });
      }

      const result = await TaxChargesTypeModel.createTaxChargesType({
        taxChargesType,
        defaultCharges,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        taxChargesTypeId: result.taxChargesTypeId
      });
    } catch (err) {
      console.error('createTaxChargesType error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        taxChargesTypeId: null
      });
    }
  }

  // Get a single Tax Charge Type by ID
  static async getTaxChargesTypeById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid TaxChargesTypeID is required',
          data: null,
          taxChargesTypeId: null
        });
      }

      const taxChargesType = await TaxChargesTypeModel.getTaxChargesTypeById(parseInt(id));

      if (!taxChargesType) {
        return res.status(404).json({
          success: false,
          message: 'Tax charge type not found',
          data: null,
          taxChargesTypeId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Tax charge type retrieved successfully',
        data: taxChargesType,
        taxChargesTypeId: id
      });
    } catch (err) {
      console.error('getTaxChargesTypeById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        taxChargesTypeId: null
      });
    }
  }

  // Update a Tax Charge Type
  static async updateTaxChargesType(req, res) {
    try {
      const { id } = req.params;
      const { taxChargesType, defaultCharges, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid TaxChargesTypeID is required',
          data: null,
          taxChargesTypeId: null
        });
      }

      if (!taxChargesType || defaultCharges == null || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'TaxChargesType, DefaultCharges, and CreatedByID are required',
          data: null,
          taxChargesTypeId: id
        });
      }

      const result = await TaxChargesTypeModel.updateTaxChargesType(parseInt(id), {
        taxChargesType,
        defaultCharges,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        taxChargesTypeId: id
      });
    } catch (err) {
      console.error('updateTaxChargesType error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        taxChargesTypeId: null
      });
    }
  }

  // Delete a Tax Charge Type
  static async deleteTaxChargesType(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid TaxChargesTypeID is required',
          data: null,
          taxChargesTypeId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          taxChargesTypeId: id
        });
      }

      const result = await TaxChargesTypeModel.deleteTaxChargesType(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        taxChargesTypeId: id
      });
    } catch (err) {
      console.error('deleteTaxChargesType error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        taxChargesTypeId: null
      });
    }
  }
}

module.exports = TaxChargesTypeController;