const CompanyModel = require('../models/companyModel');

class CompanyController {
  // Get all Companies
  static async getAllCompanies(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate query parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          companyId: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          companyId: null
        });
      }

      const result = await CompanyModel.getAllCompanies({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      res.status(200).json({
        success: true,
        message: 'Company records retrieved successfully.',
        data: result.data,
        pagination: {
          totalRecords: result.totalRecords,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        },
        companyId: null
      });
    } catch (err) {
      console.error('Error in getAllCompanies:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        companyId: null
      });
    }
  }
  
  // Create a new Company
  static async createCompany(req, res) {
    try {
      const data = req.body;
      // Validate required fields
      if (!data.companyName || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CompanyName and CreatedById are required.',
          data: null,
          companyId: null
        });
      }

      const result = await CompanyModel.createCompany(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        companyId: result.companyId
      });
    } catch (err) {
      console.error('Error in createCompany:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        companyId: null
      });
    }
  }

  // Get a single Company by ID
  static async getCompanyById(req, res) {
    try {
      const { id } = req.params;
      const company = await CompanyModel.getCompanyById(parseInt(id));
      if (!company) {
        return res.status(400).json({
          success: false,
          message: 'Company not found.',
          data: null,
          companyId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Company retrieved successfully.',
        data: company,
        companyId: id
      });
    } catch (err) {
      console.error('Error in getCompanyById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        companyId: null
      });
    }
  }

  // Update a Company
  static async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.companyName || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CompanyName and CreatedById are required.',
          data: null,
          companyId: null
        });
      }

      const result = await CompanyModel.updateCompany(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        companyId: id
      });
    } catch (err) {
      console.error('Error in updateCompany:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        companyId: null
      });
    }
  }

  // Delete a Company
  static async deleteCompany(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body; // No validation, pass as-is

      const result = await CompanyModel.deleteCompany(parseInt(id), createdById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        companyId: id
      });
    } catch (err) {
      console.error('Error in deleteCompany:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        companyId: null
      });
    }
  }
}

module.exports = CompanyController;