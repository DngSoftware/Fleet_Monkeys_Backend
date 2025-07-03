const poolPromise = require('../config/db.config');

class SupplierModel {
  // Get paginated Suppliers
  static async getAllSuppliers({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1 || pageSize > 100) pageSize = 10; // Cap pageSize at 100
      let formattedFromDate = null, formattedToDate = null;

      if (fromDate) {
        formattedFromDate = new Date(fromDate);
        if (isNaN(formattedFromDate)) throw new Error('Invalid fromDate');
      }
      if (toDate) {
        formattedToDate = new Date(toDate);
        if (isNaN(formattedToDate)) throw new Error('Invalid toDate');
      }
      if (formattedFromDate && formattedToDate && formattedFromDate > formattedToDate) {
        throw new Error('fromDate cannot be later than toDate');
      }

      const queryParams = [
        pageNumber,
        pageSize,
        formattedFromDate ? formattedFromDate.toISOString().split('T')[0] : null,
        formattedToDate ? formattedToDate.toISOString().split('T')[0] : null
      ];

      console.log('getAllSuppliers params:', JSON.stringify(queryParams, null, 2));

      // Call SP_GetAllSuppliers
      const [results] = await pool.query(
        'CALL SP_GetAllSuppliers(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getAllSuppliers results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      console.log('getAllSuppliers output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllSuppliers');
      }

      if (outParams.StatusCode !== 0) {
        throw new Error(outParams.Message || 'Failed to retrieve suppliers');
      }

      // Extract totalRecords from the second result set
      const totalRecords = results[1]?.[0]?.TotalRecords || 0;

      return {
        data: Array.isArray(results[0]) ? results[0] : [],
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllSuppliers error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Supplier
  static async createSupplier(data) {
    try {
      const pool = await poolPromise;

      // Validate input
      if (!data.supplierName || typeof data.supplierName !== 'string' || data.supplierName.trim() === '') {
        throw new Error('Valid supplierName is required');
      }
      if (!data.companyId || isNaN(parseInt(data.companyId))) {
        throw new Error('Valid companyId is required');
      }
      if (!data.userId || isNaN(parseInt(data.userId))) {
        throw new Error('Valid userId is required');
      }
      if (data.supplierEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.supplierEmail)) {
        throw new Error('Valid supplierEmail is required');
      }
      if (data.supplierGroupId && isNaN(parseInt(data.supplierGroupId))) {
        throw new Error('Valid supplierGroupId is required');
      }
      if (data.supplierTypeId && isNaN(parseInt(data.supplierTypeId))) {
        throw new Error('Valid supplierTypeId is required');
      }
      if (data.supplierAddressId && isNaN(parseInt(data.supplierAddressId))) {
        throw new Error('Valid supplierAddressId is required');
      }
      if (data.billingCurrencyId && isNaN(parseInt(data.billingCurrencyId))) {
        throw new Error('Valid billingCurrencyId is required');
      }

      const queryParams = [
        'INSERT',
        null, // p_SupplierID (INOUT)
        data.supplierName ? data.supplierName.trim() : null,
        data.supplierGroupId ? parseInt(data.supplierGroupId) : null,
        data.supplierTypeId ? parseInt(data.supplierTypeId) : null,
        data.supplierAddressId ? parseInt(data.supplierAddressId) : null,
        data.supplierExportCode ? data.supplierExportCode.trim() : null,
        data.saPartner ? parseInt(data.saPartner) : null,
        data.saPartnerExportCode ? data.saPartnerExportCode.trim() : null,
        data.supplierEmail ? data.supplierEmail.trim() : null,
        data.billingCurrencyId ? parseInt(data.billingCurrencyId) : null,
        data.companyId ? parseInt(data.companyId) : null,
        data.externalSupplierYn ? 1 : 0,
        data.userId ? parseInt(data.userId) : null
      ];

      console.log('createSupplier params:', JSON.stringify(queryParams, null, 2));

      // Call SP_ManageSupplier
      const [results] = await pool.query(
        'CALL SP_ManageSupplier(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('createSupplier results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query(
        'SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_SupplierID AS p_SupplierID'
      );

      console.log('createSupplier output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null) {
        throw new Error('Invalid output from SP_ManageSupplier');
      }

      // Treat p_Result = 1 or success message as success
      if (output[0].p_Result !== 1 && !output[0].p_Message.toLowerCase().includes('successfully')) {
        throw new Error(output[0].p_Message || 'Failed to create supplier');
      }

      return {
        supplierId: output[0].p_SupplierID || null,
        message: output[0].p_Message || 'Supplier created successfully'
      };
    } catch (err) {
      console.error('createSupplier error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Supplier by ID
  static async getSupplierById(id) {
    try {
      const pool = await poolPromise;

      const supplierId = parseInt(id, 10);
      if (isNaN(supplierId)) {
        throw new Error('Valid SupplierID is required');
      }

      const queryParams = [
        'SELECT',
        supplierId,
        null, null, null, null, null, null, null, null, null, null, null, null
      ];

      console.log('getSupplierById params:', JSON.stringify(queryParams, null, 2));

      // Call SP_ManageSupplier
      const [results] = await pool.query(
        'CALL SP_ManageSupplier(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getSupplierById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query(
        'SELECT @p_Result AS p_Result, @p_Message AS p_Message'
      );

      console.log('getSupplierById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null) {
        throw new Error('Invalid output from SP_ManageSupplier');
      }

      // Treat p_Result = 1 or success message as success
      if (output[0].p_Result !== 1 && !output[0].p_Message.toLowerCase().includes('successfully')) {
        throw new Error(output[0].p_Message || 'Supplier not found');
      }

      return Array.isArray(results[0]) && results[0].length > 0 ? results[0][0] : null;
    } catch (err) {
      console.error('getSupplierById error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Supplier
  static async updateSupplier(id, data) {
    try {
      const pool = await poolPromise;

      const supplierId = parseInt(id, 10);
      if (isNaN(supplierId)) {
        throw new Error('Valid SupplierID is required');
      }
      if (!data.supplierName || typeof data.supplierName !== 'string' || data.supplierName.trim() === '') {
        throw new Error('Valid supplierName is required');
      }
      if (!data.companyId || isNaN(parseInt(data.companyId))) {
        throw new Error('Valid companyId is required');
      }
      if (!data.userId || isNaN(parseInt(data.userId))) {
        throw new Error('Valid userId is required');
      }
      if (data.supplierEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.supplierEmail)) {
        throw new Error('Valid supplierEmail is required');
      }
      if (data.supplierGroupId && isNaN(parseInt(data.supplierGroupId))) {
        throw new Error('Valid supplierGroupId is required');
      }
      if (data.supplierTypeId && isNaN(parseInt(data.supplierTypeId))) {
        throw new Error('Valid supplierTypeId is required');
      }
      if (data.supplierAddressId && isNaN(parseInt(data.supplierAddressId))) {
        throw new Error('Valid supplierAddressId is required');
      }
      if (data.billingCurrencyId && isNaN(parseInt(data.billingCurrencyId))) {
        throw new Error('Valid billingCurrencyId is required');
      }

      const queryParams = [
        'UPDATE',
        supplierId,
        data.supplierName ? data.supplierName.trim() : null,
        data.supplierGroupId ? parseInt(data.supplierGroupId) : null,
        data.supplierTypeId ? parseInt(data.supplierTypeId) : null,
        data.supplierAddressId ? parseInt(data.supplierAddressId) : null,
        data.supplierExportCode ? data.supplierExportCode.trim() : null,
        data.saPartner ? parseInt(data.saPartner) : null,
        data.saPartnerExportCode ? data.saPartnerExportCode.trim() : null,
        data.supplierEmail ? data.supplierEmail.trim() : null,
        data.billingCurrencyId ? parseInt(data.billingCurrencyId) : null,
        data.companyId ? parseInt(data.companyId) : null,
        data.externalSupplierYn ? 1 : 0,
        data.userId ? parseInt(data.userId) : null
      ];

      console.log('updateSupplier params:', JSON.stringify(queryParams, null, 2));

      // Call SP_ManageSupplier
      const [results] = await pool.query(
        'CALL SP_ManageSupplier(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('updateSupplier results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query(
        'SELECT @p_Result AS p_Result, @p_Message AS p_Message'
      );

      console.log('updateSupplier output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null) {
        throw new Error('Invalid output from SP_ManageSupplier');
      }

      // Treat p_Result = 1 or success message as success
      if (output[0].p_Result !== 1 && !output[0].p_Message.toLowerCase().includes('successfully')) {
        throw new Error(output[0].p_Message || 'Failed to update supplier');
      }

      return {
        message: output[0].p_Message || 'Supplier updated successfully'
      };
    } catch (err) {
      console.error('updateSupplier error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Supplier
  static async deleteSupplier(id, userId) {
    try {
      const pool = await poolPromise;

      const supplierId = parseInt(id, 10);
      const validatedUserId = parseInt(userId, 10);
      if (isNaN(supplierId)) {
        throw new Error('Valid SupplierID is required');
      }
      if (isNaN(validatedUserId)) {
        throw new Error('Valid userId is required');
      }

      const queryParams = [
        'DELETE',
        supplierId,
        null, null, null, null, null, null, null, null, null, null, null,
        validatedUserId
      ];

      console.log('deleteSupplier params:', JSON.stringify(queryParams, null, 2));

      // Call SP_ManageSupplier
      const [results] = await pool.query(
        'CALL SP_ManageSupplier(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('deleteSupplier results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query(
        'SELECT @p_Result AS p_Result, @p_Message AS p_Message'
      );

      console.log('deleteSupplier output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null) {
        throw new Error('Invalid output from SP_ManageSupplier');
      }

      // Treat p_Result = 1 or success message as success
      if (output[0].p_Result !== 1 && !output[0].p_Message.toLowerCase().includes('successfully')) {
        throw new Error(output[0].p_Message || 'Failed to delete supplier');
      }

      return {
        message: output[0].p_Message || 'Supplier deleted successfully'
      };
    } catch (err) {
      console.error('deleteSupplier error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = SupplierModel;