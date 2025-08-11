const CertificationModel = require('../models/certificationModel');

class CertificationController {
  // Get all Certifications
static async getAllCertifications(req, res) {
  try {
    const { pageNumber, pageSize, fromDate, toDate } = req.query;

    // Validate query parameters
    if (pageNumber && isNaN(parseInt(pageNumber))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pageNumber',
        data: null,
        certificationId: null
      });
    }
    if (pageSize && isNaN(parseInt(pageSize))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pageSize',
        data: null,
        certificationId: null
      });
    }

    const result = await CertificationModel.getAllCertifications({
      pageNumber: parseInt(pageNumber) || 1,
      pageSize: parseInt(pageSize) || 10,
      fromDate: fromDate || null,
      toDate: toDate || null
    });

    res.status(200).json({
      success: true,
      message: 'Certification records retrieved successfully.',
      data: result.data,
      pagination: {
        totalRecords: result.totalRecords,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      },
      certificationId: null
    });
  } catch (err) {
    console.error('Error in getAllCertifications:', err);
    res.status(500).json({
      success: false,
      message: `Server error: ${err.message}`,
      data: null,
      certificationId: null
    });
  }
}

  // Create a new Certification
  static async createCertification(req, res) {
    try {
      const data = req.body;
      // Validate required fields
      if (!data.certificationName || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CertificationName and CreatedById are required.',
          data: null,
          certificationId: null
        });
      }

      const result = await CertificationModel.createCertification(data);
      res.status(201).json({
        success: result.success,
        message: result.message,
        data: null,
        certificationId: result.certificationId
      });
    } catch (err) {
      console.error('Error in createCertification:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        certificationId: null
      });
    }
  }

  // Get a single Certification by ID
  static async getCertificationById(req, res) {
    try {
      const { id } = req.params;
      const certification = await CertificationModel.getCertificationById(parseInt(id));
      if (!certification || !certification.data) {
        return res.status(404).json({
          success: false,
          message: 'Certification not found.',
          data: null,
          certificationId: null
        });
      }
      res.status(200).json({
        success: true,
        message: certification.message,
        data: certification.data,
        certificationId: id
      });
    } catch (err) {
      console.error('Error in getCertificationById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        certificationId: null
      });
    }
  }

  // Update a Certification
  static async updateCertification(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedById is required.',
          data: null,
          certificationId: null
        });
      }

      const result = await CertificationModel.updateCertification(parseInt(id), data);
      res.status(200).json({
        success: result.success,
        message: result.message,
        data: null,
        certificationId: id
      });
    } catch (err) {
      console.error('Error in updateCertification:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        certificationId: null
      });
    }
  }

  // Delete a Certification
  static async deleteCertification(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;
      // Validate required fields
      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedById is required.',
          data: null,
          certificationId: null
        });
      }

      const result = await CertificationModel.deleteCertification(parseInt(id), createdById);
      res.status(200).json({
        success: result.success,
        message: result.message,
        data: null,
        certificationId: id
      });
    } catch (err) {
      console.error('Error in deleteCertification:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        certificationId: null
      });
    }
  }
}

module.exports = CertificationController;