const AddressTypeModel = require('../models/addressTypeModel');

class AddressTypeController {
  // Get all AddressTypes
static async getAllAddressTypes(req, res) {
  try {
    const { pageNumber, pageSize, fromDate, toDate } = req.query;

    // Validate query parameters
    if (pageNumber && isNaN(parseInt(pageNumber))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pageNumber',
        data: null,
        addressTypeId: null,
        newAddressTypeId: null
      });
    }
    if (pageSize && isNaN(parseInt(pageSize))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pageSize',
        data: null,
        addressTypeId: null,
        newAddressTypeId: null
      });
    }

    const result = await AddressTypeModel.getAllAddressTypes({
      pageNumber: parseInt(pageNumber) || 1,
      pageSize: parseInt(pageSize) || 10,
      fromDate: fromDate || null,
      toDate: toDate || null
    });

    res.status(200).json({
      success: true,
      message: 'AddressType records retrieved successfully.',
      data: result.data,
      pagination: {
        totalRecords: result.totalRecords,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      },
      addressTypeId: null,
      newAddressTypeId: null
    });
  } catch (err) {
    console.error('Error in getAllAddressTypes:', err);
    res.status(500).json({
      success: false,
      message: `Server error: ${err.message}`,
      data: null,
      addressTypeId: null,
      newAddressTypeId: null
    });
  }
}

  // Create a new AddressType
  static async createAddressType(req, res) {
    try {
      const data = req.body;
      // Validate required fields
      if (!data.addressType || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'AddressType and CreatedByID are required.',
          data: null,
          addressTypeId: null,
          newAddressTypeId: null
        });
      }

      const result = await AddressTypeModel.createAddressType(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        addressTypeId: null,
        newAddressTypeId: result.newAddressTypeId
      });
    } catch (err) {
      console.error('Error in createAddressType:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressTypeId: null,
        newAddressTypeId: null
      });
    }
  }

  // Get a single AddressType by ID
  static async getAddressTypeById(req, res) {
    try {
      const { id } = req.params;
      const addressType = await AddressTypeModel.getAddressTypeById(parseInt(id));
      if (!addressType) {
        return res.status(404).json({
          success: false,
          message: 'AddressType not found.',
          data: null,
          addressTypeId: null,
          newAddressTypeId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'AddressType retrieved successfully.',
        data: addressType,
        addressTypeId: id,
        newAddressTypeId: null
      });
    } catch (err) {
      console.error('Error in getAddressTypeById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressTypeId: null,
        newAddressTypeId: null
      });
    }
  }

  // Update an AddressType
  static async updateAddressType(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.addressType || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'AddressType and CreatedByID are required.',
          data: null,
          addressTypeId: null,
          newAddressTypeId: null
        });
      }

      const result = await AddressTypeModel.updateAddressType(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        addressTypeId: id,
        newAddressTypeId: null
      });
    } catch (err) {
      console.error('Error in updateAddressType:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressTypeId: null,
        newAddressTypeId: null
      });
    }
  }

  // Delete an AddressType
  static async deleteAddressType(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;
      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required.',
          data: null,
          addressTypeId: null,
          newAddressTypeId: null
        });
      }

      const result = await AddressTypeModel.deleteAddressType(parseInt(id), createdById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        addressTypeId: id,
        newAddressTypeId: null
      });
    } catch (err) {
      console.error('Error in deleteAddressType:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        addressTypeId: null,
        newAddressTypeId: null
      });
    }
  }
}

module.exports = AddressTypeController;