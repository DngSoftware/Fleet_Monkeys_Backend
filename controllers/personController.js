const PersonModel = require('../models/personModel');

class PersonController {
  // Get all Persons with pagination
  static async getAllPersons(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate query parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          personId: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          personId: null
        });
      }

      const persons = await PersonModel.getAllPersons({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate,
        toDate
      });

      return res.status(200).json({
        success: true,
        message: 'Persons retrieved successfully',
        data: persons.data,
        pagination: {
          totalRecords: persons.totalRecords,
          currentPage: persons.currentPage,
          pageSize: persons.pageSize,
          totalPages: persons.totalPages
        }
      });
    } catch (err) {
      console.error('getAllPersons error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        personId: null
      });
    }
  }

  // Create a new Person
  static async createPerson(req, res) {
    try {
      const {
        firstName,
        middleName,
        lastName,
        roleId,
        status,
        salutation,
        designation,
        gender,
        dob,
        joiningDate,
        companyId,
        isExternal,
        loginId,
        password,
        emailId,
        isDarkMode,
        createdById
      } = req.body;

      // Basic validation
      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          personId: null
        });
      }

      const result = await PersonModel.createPerson({
        firstName,
        middleName,
        lastName,
        roleId,
        status,
        salutation,
        designation,
        gender,
        dob,
        joiningDate,
        companyId,
        isExternal,
        loginId,
        password,
        emailId,
        isDarkMode,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        personId: result.personId
      });
    } catch (err) {
      console.error('createPerson error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        personId: null
      });
    }
  }

  // Get a single Person by ID
  static async getPersonById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid PersonID is required',
          data: null,
          personId: null
        });
      }

      const person = await PersonModel.getPersonById(parseInt(id));

      if (!person) {
        return res.status(404).json({
          success: false,
          message: 'Person not found',
          data: null,
          personId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Person retrieved successfully',
        data: person,
        personId: id
      });
    } catch (err) {
      console.error('getPersonById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        personId: null
      });
    }
  }

  // Update a Person
  static async updatePerson(req, res) {
    try {
      const { id } = req.params;
      const {
        firstName,
        middleName,
        lastName,
        roleId,
        status,
        salutation,
        designation,
        gender,
        dob,
        joiningDate,
        companyId,
        isExternal,
        loginId,
        password,
        emailId,
        isDarkMode,
        createdById
      } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid PersonID is required',
          data: null,
          personId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          personId: id
        });
      }

      const result = await PersonModel.updatePerson(parseInt(id), {
        firstName,
        middleName,
        lastName,
        roleId,
        status,
        salutation,
        designation,
        gender,
        dob,
        joiningDate,
        companyId,
        isExternal,
        loginId,
        password,
        emailId,
        isDarkMode,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        personId: id
      });
    } catch (err) {
      console.error('updatePerson error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        personId: null
      });
    }
  }

  // Delete a Person
  static async deletePerson(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid PersonID is required',
          data: null,
          personId: null
        });
      }

      const result = await PersonModel.deletePerson(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        personId: id
      });
    } catch (err) {
      console.error('deletePerson error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        personId: null
      });
    }
  }

  static async uploadProfileImage(req, res) {
    try {
      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          personId: null
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
          data: null,
          personId: null
        });
      }

      const personId = parseInt(req.params.id);
      const isAdmin = req.user.role === 'Administrator';
      if (personId !== req.user.personId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own profile image or must be an Administrator',
          data: null,
          personId
        });
      }

      const pool = await require('../config/db.config');
      const [results] = await pool.query(
        'SELECT ProfileImage FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
        [personId]
      );

      if (results.length > 0 && results[0].ProfileImage) {
        const oldImagePath = path.join(__dirname, '../', results[0].ProfileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`Deleted old image: ${oldImagePath}`);
        }
      }

      const profileImage = `/Uploads/${req.file.filename}`;

      const result = await PersonModel.updateProfileImage({
        personId,
        profileImage,
        createdById: req.user.personId
      });

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
        data: result.data,
        personId
      });
    } catch (err) {
      console.error('uploadProfileImage error:', err);
      if (err.code === 'ENOENT') {
        return res.status(500).json({
          success: false,
          message: 'Upload directory not found. Please contact the administrator.',
          data: null,
          personId: null
        });
      }
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        personId: null
      });
    }
  }
}

module.exports = PersonController;