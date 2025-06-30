const SupplierModel = require('../models/supplierModel');

class SupplierController {
  // Get all Suppliers with pagination
  static async getAllSuppliers(req, res) {
    try {
      // Check if req.query exists
      if (!req.query) {
        return res.status(400).json({
          success: false,
          message: 'Query parameters are missing',
          data: null,
          totalRecords: 0
        });
      }

      // Extract and validate query parameters
      const { pageNumber = '1', pageSize = '10', fromDate, toDate } = req.query;

      const pageNum = parseInt(pageNumber, 10);
      const pageSz = parseInt(pageSize, 10);

      // Validate pagination parameters
      if (isNaN(pageNum) || pageNum < 1 || isNaN(pageSz) || pageSz < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber or pageSize',
          data: null,
          totalRecords: 0
        });
      }

      const suppliers = await SupplierModel.getAllSuppliers({
        pageNumber: pageNum,
        pageSize: pageSz,
        fromDate,
        toDate
      });

      return res.status(200).json({
        success: true,
        message: 'Suppliers retrieved successfully',
        data: suppliers.data,
        totalRecords: suppliers.totalRecords
      });
    } catch (err) {
      console.error('getAllSuppliers error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        totalRecords: 0
      });
    }
  }

  // Create a new Supplier
  static async createSupplier(req, res) {
    try {
      const {
        supplierName,
        supplierGroupId,
        supplierTypeId,
        supplierAddressId,
        supplierExportCode,
        saPartner,
        saPartnerExportCode,
        supplierEmail,
        billingCurrencyId,
        companyId,
        externalSupplierYn,
        userId
      } = req.body;

      // Basic validation
      if (!supplierName || !companyId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'SupplierName, CompanyId, and UserId are required',
          data: null,
          supplierId: null
        });
      }

      const result = await SupplierModel.createSupplier({
        supplierName,
        supplierGroupId,
        supplierTypeId,
        supplierAddressId,
        supplierExportCode,
        saPartner,
        saPartnerExportCode,
        supplierEmail,
        billingCurrencyId,
        companyId,
        externalSupplierYn,
        userId
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        supplierId: result.supplierId
      });
    } catch (err) {
      console.error('createSupplier error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierId: null
      });
    }
  }

  // Get a single Supplier by ID
  static async getSupplierById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid SupplierID is required',
          data: null,
          supplierId: null
        });
      }

      const supplier = await SupplierModel.getSupplierById(parseInt(id));

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found',
          data: null,
          supplierId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Supplier retrieved successfully',
        data: supplier,
        supplierId: id
      });
    } catch (err) {
      console.error('getSupplierById error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierId: null
      });
    }
  }

  // Update a Supplier
  static async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const {
        supplierName,
        supplierGroupId,
        supplierTypeId,
        supplierAddressId,
        supplierExportCode,
        saPartner,
        saPartnerExportCode,
        supplierEmail,
        billingCurrencyId,
        companyId,
        externalSupplierYn,
        userId
      } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid SupplierID is required',
          data: null,
          supplierId: null
        });
      }

      if (!supplierName || !companyId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'SupplierName, CompanyId, and UserId are required',
          data: null,
          supplierId: id
        });
      }

      const result = await SupplierModel.updateSupplier(parseInt(id), {
        supplierName,
        supplierGroupId,
        supplierTypeId,
        supplierAddressId,
        supplierExportCode,
        saPartner,
        saPartnerExportCode,
        supplierEmail,
        billingCurrencyId,
        companyId,
        externalSupplierYn,
        userId
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        supplierId: id
      });
    } catch (err) {
      console.error('updateSupplier error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierId: null
      });
    }
  }

  // Delete a Supplier
  static async deleteSupplier(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid SupplierID is required',
          data: null,
          supplierId: null
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'UserId is required',
          data: null,
          supplierId: id
        });
      }

      const result = await SupplierModel.deleteSupplier(parseInt(id), userId);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        supplierId: id
      });
    } catch (err) {
      console.error('deleteSupplier error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierId: null
      });
    }
  }
}

module.exports = SupplierController;
