const CustomerAddressModel = require('../models/customerAddressModel');

class CustomerAddressController {
  // Create a new customer-address linkage
  static async createCustomerAddress(req, res) {
    try {
      const data = req.body;

      // Validate required fields for customer and address
      const requiredCustomerFields = [
        'customerName',
        'customerEmail',
        'companyId',
        'importCode',
        'billingCurrencyId',
        'website',
        'customerNotes',
        'isInQuickBooks',
        'quickBookAccountId'
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
      const requiredLinkageFields = ['isDefault', 'createdById'];

      // Check for missing customer fields
      const missingCustomerFields = requiredCustomerFields.filter(field => data[field] === undefined || data[field] === null);
      if (data.customerId === undefined && missingCustomerFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required customer fields: ${missingCustomerFields.join(', ')}`,
          data: null,
          customerId: null,
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
          customerId: null,
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
          customerId: null,
          addressId: null
        });
      }

      const result = await CustomerAddressModel.createCustomerAddress(data);

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        customerId: result.customerId,
        addressId: result.addressId
      });
    } catch (err) {
      console.error('createCustomerAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null,
        addressId: null
      });
    }
  }

  // Get all addresses for a customer
  static async getAllAddressesByCustomerId(req, res) {
    try {
      const { customerId } = req.params;

      // Validate customerId
      if (!customerId || isNaN(customerId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerID is required',
          data: null,
          customerId: null,
          addressId: null
        });
      }

      const results = await CustomerAddressModel.getAllAddressesByCustomerId(parseInt(customerId));

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No addresses found for this customer',
          data: null,
          customerId: customerId,
          addressId: null
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Addresses retrieved successfully',
        data: results,
        customerId: customerId,
        addressId: null
      });
    } catch (err) {
      console.error('getAllAddressesByCustomerId error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null,
        addressId: null
      });
    }
  }

  // Get a customer-address linkage
  static async getCustomerAddress(req, res) {
    try {
      const { customerId, addressId } = req.params;

      // Validate IDs
      if (!customerId || !addressId || isNaN(customerId) || isNaN(addressId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerID and AddressID are required',
          data: null,
          customerId: null,
          addressId: null
        });
      }

      const result = await CustomerAddressModel.getCustomerAddress(parseInt(customerId), parseInt(addressId));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Customer-address linkage not found',
          data: null,
          customerId: customerId,
          addressId: addressId
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Customer address linkage retrieved successfully',
        data: result,
        customerId: customerId,
        addressId: addressId
      });
    } catch (err) {
      console.error('getCustomerAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null,
        addressId: null
      });
    }
  }

  // Update a customer-address linkage
  static async updateCustomerAddress(req, res) {
    try {
      const { customerId, addressId } = req.params;
      const data = req.body;

      // Validate IDs and createdById
      if (!customerId || !addressId || isNaN(customerId) || isNaN(addressId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerID and AddressID are required',
          data: null,
          customerId: null,
          addressId: null
        });
      }
      if (!data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          customerId: null,
          addressId: null
        });
      }

      const result = await CustomerAddressModel.updateCustomerAddress(parseInt(customerId), parseInt(addressId), data);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        customerId: result.customerId,
        addressId: result.addressId
      });
    } catch (err) {
      console.error('updateCustomerAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null,
        addressId: null
      });
    }
  }

  // Delete a customer, address, or customer-address linkage
  static async deleteCustomerAddress(req, res) {
    try {
      const { customerId, addressId } = req.params;
      const { createdById } = req.body;

      // Validate inputs
      if (!customerId && !addressId) {
        return res.status(400).json({
          success: false,
          message: 'Either CustomerID or AddressID must be provided',
          data: null,
          customerId: null,
          addressId: null
        });
      }
      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          customerId: null,
          addressId: null
        });
      }

      const result = await CustomerAddressModel.deleteCustomerAddress(
        customerId ? parseInt(customerId) : null,
        addressId ? parseInt(addressId) : null,
        createdById
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        customerId: result.customerId,
        addressId: result.addressId
      });
    } catch (err) {
      console.error('deleteCustomerAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null,
        addressId: null
      });
    }
  }
}

module.exports = CustomerAddressController;