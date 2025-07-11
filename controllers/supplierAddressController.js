const SupplierAddressModel = require('../models/supplierAddressModel');

class SupplierAddressController {
  // Create a new supplier-address linkage
  static async createSupplierAddress(req, res) {
    try {
      const data = req.body;

      // Validate required fields for supplier and address
      const requiredSupplierFields = [
        'supplierName',
        'supplierEmail',
        'supplierGroupId',
        'supplierTypeId',
        'supplierExportCode',
        'saPartner',
        'saPartnerExportCode',
        'billingCurrencyId',
        'companyId',
        'externalSupplierYN'
      ];
      const requiredAddressFields = [
        'addressTitle',
        'addressName',
        'addressTypeId',
        'addressLine1',
        'addressLine2',
        'city',
        'county',
        'state',
        'postalCode',
        'country',
        'preferredBillingAddress',
        'preferredShippingAddress',
        'longitude',
        'latitude',
        'disabled'
      ];
      const requiredLinkageFields = ['isDefault', 'userId'];

      // Check for missing supplier fields
      const missingSupplierFields = requiredSupplierFields.filter(field => data[field] === undefined || data[field] === null);
      if (data.supplierId === undefined && missingSupplierFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required supplier fields: ${missingSupplierFields.join(', ')}`,
          data: null,
          supplierId: null,
          addressId: null
        });
      }

      // Check for missing address fields
      const missingAddressFields = requiredAddressFields.filter(field => data[field] === undefined || data[field] === null);
      if (data.addressId === undefined && missingAddressFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required address fields: ${missingAddressFields.join(', ')}`,
          data: null,
          supplierId: null,
          addressId: null
        });
      }

      // Check for missing linkage fields
      const missingLinkageFields = requiredLinkageFields.filter(field => data[field] === undefined || data[field] === null);
      if (missingLinkageFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required linkage fields: ${missingLinkageFields.join(', ')}`,
          data: null,
          supplierId: null,
          addressId: null
        });
      }

      const result = await SupplierAddressModel.createSupplierAddress(data);

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        supplierId: result.supplierId,
        addressId: result.addressId
      });
    } catch (err) {
      console.error('createSupplierAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierId: null,
        addressId: null
      });
    }
  }

  // Get all addresses for a supplier
  static async getAllAddressesBySupplierId(req, res) {
    try {
      const { supplierId } = req.params;

      // Validate supplierId
      if (!supplierId || isNaN(supplierId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid SupplierID is required',
          data: null,
          supplierId: null,
          addressId: null
        });
      }

      const results = await SupplierAddressModel.getAllAddressesBySupplierId(parseInt(supplierId));

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No addresses found for this supplier',
          data: null,
          supplierId: supplierId,
          addressId: null
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Addresses retrieved successfully',
        data: results,
        supplierId: supplierId,
        addressId: null
      });
    } catch (err) {
      console.error('getAllAddressesBySupplierId error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierId: null,
        addressId: null
      });
    }
  }

  // Get a supplier-address linkage
  static async getSupplierAddress(req, res) {
    try {
      const { supplierId, addressId } = req.params;

      // Validate IDs
      if (!supplierId || !addressId || isNaN(supplierId) || isNaN(addressId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid SupplierID and AddressID are required',
          data: null,
          supplierId: null,
          addressId: null
        });
      }

      const result = await SupplierAddressModel.getSupplierAddress(parseInt(supplierId), parseInt(addressId));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Supplier-address linkage not found',
          data: null,
          supplierId: supplierId,
          addressId: addressId
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Supplier address linkage retrieved successfully',
        data: result,
        supplierId: supplierId,
        addressId: addressId
      });
    } catch (err) {
      console.error('getSupplierAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierId: null,
        addressId: null
      });
    }
  }

  // Update a supplier-address linkage
  static async updateSupplierAddress(req, res) {
    try {
      const { supplierId, addressId } = req.params;
      const data = req.body;

      // Validate IDs and userId
      if (!supplierId || !addressId || isNaN(supplierId) || isNaN(addressId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid SupplierID and AddressID are required',
          data: null,
          supplierId: null,
          addressId: null
        });
      }
      if (!data.userId) {
        return res.status(400).json({
          success: false,
          message: 'UserID is required',
          data: null,
          supplierId: null,
          addressId: null
        });
      }

      const result = await SupplierAddressModel.updateSupplierAddress(parseInt(supplierId), parseInt(addressId), data);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        supplierId: result.supplierId,
        addressId: result.addressId
      });
    } catch (err) {
      console.error('updateSupplierAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierId: null,
        addressId: null
      });
    }
  }

  // Delete a supplier, address, or supplier-address linkage
  static async deleteSupplierAddress(req, res) {
    try {
      const { supplierId, addressId } = req.params;
      const { userId } = req.body;

      // Validate inputs
      if (!supplierId && !addressId) {
        return res.status(400).json({
          success: false,
          message: 'Either SupplierID or AddressID must be provided',
          data: null,
          supplierId: null,
          addressId: null
        });
      }
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'UserID is required',
          data: null,
          supplierId: null,
          addressId: null
        });
      }

      const result = await SupplierAddressModel.deleteSupplierAddress(
        supplierId ? parseInt(supplierId) : null,
        addressId ? parseInt(addressId) : null,
        userId
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        supplierId: result.supplierId,
        addressId: result.addressId
      });
    } catch (err) {
      console.error('deleteSupplierAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierId: null,
        addressId: null
      });
    }
  }
}

module.exports = SupplierAddressController;