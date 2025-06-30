const AddressModel = require('../models/addressModel');

class AddressController {
  // Get all Addresses with pagination
 static async getAllAddresses(req, res) {
  try {
    const { pageNumber, pageSize, fromDate, toDate } = req.query;

    // Validate query parameters
    if (pageNumber && isNaN(parseInt(pageNumber))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pageNumber',
        data: null,
        addressId: null
      });
    }
    if (pageSize && isNaN(parseInt(pageSize))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pageSize',
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

      // Basic validation
      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
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
        createdById
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

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid AddressID is required',
          data: null,
          addressId: null
        });
      }

      const address = await AddressModel.getAddressById(parseInt(id));

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
          data: null,
          addressId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Address retrieved successfully',
        data: address,
        addressId: id
      });
    } catch (err) {
      console.error('getAddressById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressId: null
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

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid AddressID is required',
          data: null,
          addressId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          addressId: id
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
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        addressId: id
      });
    } catch (err) {
      console.error('updateAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressId: null
      });
    }
  }

  // Delete an Address
  static async deleteAddress(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid AddressID is required',
          data: null,
          addressId: null
        });
      }

      const result = await AddressModel.deleteAddress(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        addressId: id
      });
    } catch (err) {
      console.error('deleteAddress error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressId: null
      });
    }
  }
}

module.exports = AddressController;