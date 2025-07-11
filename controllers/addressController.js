const AddressModel = require('../models/addressModel');

class AddressController {
  // Get all Addresses with pagination
  static async getAllAddresses(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate query parameters
      if (pageNumber && (isNaN(parseInt(pageNumber)) || parseInt(pageNumber) < 1)) {
        return res.status(400).json({
          success: false,
          message: 'pageNumber must be a positive integer',
          data: null,
          addressId: null
        });
      }
      if (pageSize && (isNaN(parseInt(pageSize)) || parseInt(pageSize) < 1)) {
        return res.status(400).json({
          success: false,
          message: 'pageSize must be a positive integer',
          data: null,
          addressId: null
        });
      }

      const addresses = await AddressModel.getAllAddresses({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate,
        toDate
      });

      return res.status(200).json({
        success: true,
        message: 'Addresses retrieved successfully',
        data: addresses.data,
        pagination: {
          totalRecords: addresses.totalRecords,
          currentPage: addresses.currentPage,
          pageSize: addresses.pageSize,
          totalPages: addresses.totalPages
        }
      });
    } catch (err) {
      console.error('getAllAddresses error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressId: null
      });
    }
  }

  // Create a new Address
  static async createAddress(req, res) {
    try {
      const {
        addressTitle,
        addressName,
        addressTypeId,
        addressLine1,
        addressLine2,
        city,
        county,
        state,
        postalCode,
        country,
        preferredBillingAddress,
        preferredShippingAddress,
        longitude,
        latitude,
        disabled,
        createdById
      } = req.body;

      // Validate required fields
      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid createdById is required',
          data: null,
          addressId: null
        });
      }
      if (!addressLine1) {
        return res.status(400).json({
          success: false,
          message: 'addressLine1 is required',
          data: null,
          addressId: null
        });
      }

      const result = await AddressModel.createAddress({
        addressTitle,
        addressName,
        addressTypeId,
        addressLine1,
        addressLine2,
        city,
        county,
        state,
        postalCode,
        country,
        preferredBillingAddress,
        preferredShippingAddress,
        longitude,
        latitude,
        disabled,
        createdById: parseInt(createdById)
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        addressId: result.addressId
      });
    } catch (err) {
      console.error('createAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressId: null
      });
    }
  }

  // Get a single Address by ID
  static async getAddressById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid AddressID is required',
          data: null,
          addressId: null
        });
      }

      const address = await AddressModel.getAddressById(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Address retrieved successfully',
        data: address,
        addressId: parseInt(id)
      });
    } catch (err) {
      console.error('getAddressById error:', err);
      return res.status(err.message.includes('not found') ? 404 : 500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressId: parseInt(id) || null
      });
    }
  }

  // Update an Address
  static async updateAddress(req, res) {
    try {
      const { id } = req.params;
      const {
        addressTitle,
        addressName,
        addressTypeId,
        addressLine1,
        addressLine2,
        city,
        county,
        state,
        postalCode,
        country,
        preferredBillingAddress,
        preferredShippingAddress,
        longitude,
        latitude,
        disabled,
        createdById
      } = req.body;

      // Validate required fields
      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid AddressID is required',
          data: null,
          addressId: null
        });
      }
      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid createdById is required',
          data: null,
          addressId: parseInt(id)
        });
      }
      if (!addressLine1) {
        return res.status(400).json({
          success: false,
          message: 'addressLine1 is required',
          data: null,
          addressId: parseInt(id)
        });
      }

      const result = await AddressModel.updateAddress(parseInt(id), {
        addressTitle,
        addressName,
        addressTypeId,
        addressLine1,
        addressLine2,
        city,
        county,
        state,
        postalCode,
        country,
        preferredBillingAddress,
        preferredShippingAddress,
        longitude,
        latitude,
        disabled,
        createdById: parseInt(createdById)
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        addressId: parseInt(id)
      });
    } catch (err) {
      console.error('updateAddress error:', err);
      return res.status(err.message.includes('not found') ? 404 : 500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressId: parseInt(id) || null
      });
    }
  }

  // Delete an Address
  static async deleteAddress(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      // Validate required fields
      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid AddressID is required',
          data: null,
          addressId: null
        });
      }
      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid createdById is required',
          data: null,
          addressId: parseInt(id)
        });
      }

      const result = await AddressModel.deleteAddress(parseInt(id), parseInt(createdById));

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        addressId: parseInt(id)
      });
    } catch (err) {
      console.error('deleteAddress error:', err);
      return res.status(err.message.includes('not found') ? 404 : 500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressId: parseInt(id) || null
      });
    }
  }
}

module.exports = AddressController;