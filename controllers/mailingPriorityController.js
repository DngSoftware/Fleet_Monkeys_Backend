const MailingPriorityModel = require('../models/mailingPriorityModel');

class MailingPriorityController {
  // Get all Mailing Priorities with pagination
  static async getAllMailingPriorities(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Parse query parameters with defaults
      const mailingPriorities = await MailingPriorityModel.getAllMailingPriorities({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate,
        toDate
      });

      // Validate totalRecords
      if (typeof mailingPriorities.totalRecords === 'undefined' || mailingPriorities.totalRecords < 0) {
        console.warn('Invalid totalRecords:', mailingPriorities.totalRecords);
        mailingPriorities.totalRecords = 0;
      }

      return res.status(200).json({
        success: true,
        message: 'Mailing Priorities retrieved successfully',
        data: mailingPriorities.data,
        totalRecords: mailingPriorities.totalRecords
      });
    } catch (err) {
      console.error('getAllMailingPriorities error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        mailingPriorityId: null
      });
    }
  }

  // Create a new Mailing Priority
  static async createMailingPriority(req, res) {
    try {
      const { priorityName, priorityDescription, createdById } = req.body;

      // Basic validation
      if (!priorityName || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'PriorityName and CreatedByID are required',
          data: null,
          mailingPriorityId: null
        });
      }

      const result = await MailingPriorityModel.createMailingPriority({
        priorityName,
        priorityDescription,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        mailingPriorityId: result.mailingPriorityId
      });
    } catch (err) {
      console.error('createMailingPriority error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        mailingPriorityId: null
      });
    }
  }

  // Get a single Mailing Priority by ID
  static async getMailingPriorityById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid MailingPriorityID is required',
          data: null,
          mailingPriorityId: null
        });
      }

      const mailingPriority = await MailingPriorityModel.getMailingPriorityById(parseInt(id));

      if (!mailingPriority) {
        return res.status(404).json({
          success: false,
          message: 'Mailing Priority not found',
          data: null,
          mailingPriorityId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Mailing Priority retrieved successfully',
        data: mailingPriority,
        mailingPriorityId: id
      });
    } catch (err) {
      console.error('getMailingPriorityById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        mailingPriorityId: null
      });
    }
  }

  // Update a Mailing Priority
  static async updateMailingPriority(req, res) {
    try {
      const { id } = req.params;
      const { priorityName, priorityDescription, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid MailingPriorityID is required',
          data: null,
          mailingPriorityId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          mailingPriorityId: id
        });
      }

      const result = await MailingPriorityModel.updateMailingPriority(parseInt(id), {
        priorityName,
        priorityDescription,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        mailingPriorityId: id
      });
    } catch (err) {
      console.error('updateMailingPriority error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        mailingPriorityId: null
      });
    }
  }

  // Delete a Mailing Priority
  static async deleteMailingPriority(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid MailingPriorityID is required',
          data: null,
          mailingPriorityId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          mailingPriorityId: id
        });
      }

      const result = await MailingPriorityModel.deleteMailingPriority(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        mailingPriorityId: id
      });
    } catch (err) {
      console.error('deleteMailingPriority error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        mailingPriorityId: null
      });
    }
  }
}

module.exports = MailingPriorityController;