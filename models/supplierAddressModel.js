const poolPromise = require('../config/db.config');

class SupplierAddressModel {
  // Create a new supplier-address linkage
  static async createSupplierAddress(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        data.supplierId || null,
        data.addressId || null,
        data.supplierName,
        data.supplierGroupId,
        data.supplierTypeId,
        data.supplierExportCode,
        data.saPartner,
        data.saPartnerExportCode,
        data.supplierEmail,
        data.billingCurrencyId,
        data.companyId,
        data.externalSupplierYN ? 1 : 0,
        data.addressTitle,
        data.addressName,
        data.addressTypeId,
        data.addressLine1,
        data.addressLine2,
        data.city,
        data.county,
        data.state,
        data.postalCode,
        data.country,
        data.preferredBillingAddress ? 1 : 0,
        data.preferredShippingAddress ? 1 : 0,
        data.longitude,
        data.latitude,
        data.disabled ? 1 : 0,
        data.isDefault ? 1 : 0,
        data.userId
      ];

      // Log query parameters
      console.log('createSupplierAddress params:', queryParams);

      // Call SP_ManageSupplierAddress
      const [results] = await pool.query(
        `CALL SP_ManageSupplierAddress(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_SupplierID_OUT, @p_AddressID_OUT, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('createSupplierAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_SupplierID_OUT AS supplierId, @p_AddressID_OUT AS addressId, @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('createSupplierAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageSupplierAddress');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create supplier-address linkage');
      }

      return {
        supplierId: output[0].supplierId,
        addressId: output[0].addressId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createSupplierAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get all addresses for a supplier
  static async getAllAddressesBySupplierId(supplierId) {
    try {
      const pool = await poolPromise;

      // Validate supplierId
      if (!supplierId || isNaN(supplierId)) {
        throw new Error('Valid SupplierID is required');
      }

      // Query to fetch all addresses for the supplier
      const [results] = await pool.query(
        `SELECT 
            sa.AddressID,
            sa.SupplierID,
            sa.AddressTypeID,
            sa.IsDefault,
            a.AddressLine1,
            a.AddressLine2,
            a.City,
            a.County,
            a.State,
            a.PostalCode,
            a.Country,
            a.AddressTitle,
            a.AddressName,
            a.PreferredBillingAddress,
            a.PreferredShippingAddress,
            a.Longitude,
            a.Latitude,
            a.Disabled,
            at.AddressType,
            sa.CreatedByID,
            sa.CreatedDateTime,
            sa.RowVersionColumn,
            s.SupplierName,
            s.SupplierEmail,
            s.SupplierAddressID
         FROM dbo_tblsupplieraddress sa
         LEFT JOIN dbo_tbladdresses a ON sa.AddressID = a.AddressID
         LEFT JOIN dbo_tbladdresstype at ON sa.AddressTypeID = at.AddressTypeID
         LEFT JOIN dbo_tblsupplier s ON sa.SupplierID = s.SupplierID
         WHERE sa.SupplierID = ? AND sa.IsDeleted = 0`,
        [supplierId]
      );

      // Log results
      console.log('getAllAddressesBySupplierId results:', JSON.stringify(results, null, 2));

      return results;
    } catch (err) {
      console.error('getAllAddressesBySupplierId error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a supplier-address linkage by SupplierID and AddressID
  static async getSupplierAddress(supplierId, addressId) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        supplierId,
        addressId,
        null, // p_SupplierName
        null, // p_SupplierGroupID
        null, // p_SupplierTypeID
        null, // p_SupplierExportCode
        null, // p_SAPartner
        null, // p_SAPartnerExportCode
        null, // p_SupplierEmail
        null, // p_BillingCurrencyID
        null, // p_CompanyID
        null, // p_ExternalSupplierYN
        null, // p_AddressTitle
        null, // p_AddressName
        null, // p_AddressTypeID
        null, // p_AddressLine1
        null, // p_AddressLine2
        null, // p_City
        null, // p_County
        null, // p_State
        null, // p_PostalCode
        null, // p_Country
        null, // p_PreferredBillingAddress
        null, // p_PreferredShippingAddress
        null, // p_Longitude
        null, // p_Latitude
        null, // p_Disabled
        null, // p_IsDefault
        null  // p_UserID
      ];

      // Log query parameters
      console.log('getSupplierAddress params:', queryParams);

      // Call SP_ManageSupplierAddress
      const [results] = await pool.query(
        `CALL SP_ManageSupplierAddress(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_SupplierID_OUT, @p_AddressID_OUT, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('getSupplierAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_SupplierID_OUT AS supplierId, @p_AddressID_OUT AS addressId, @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getSupplierAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageSupplierAddress');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Supplier-address linkage not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getSupplierAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a supplier-address linkage
  static async updateSupplierAddress(supplierId, addressId, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        supplierId,
        addressId,
        data.supplierName,
        data.supplierGroupId,
        data.supplierTypeId,
        data.supplierExportCode,
        data.saPartner,
        data.saPartnerExportCode,
        data.supplierEmail,
        data.billingCurrencyId,
        data.companyId,
        data.externalSupplierYN ? 1 : 0,
        data.addressTitle,
        data.addressName,
        data.addressTypeId,
        data.addressLine1,
        data.addressLine2,
        data.city,
        data.county,
        data.state,
        data.postalCode,
        data.country,
        data.preferredBillingAddress ? 1 : 0,
        data.preferredShippingAddress ? 1 : 0,
        data.longitude,
        data.latitude,
        data.disabled ? 1 : 0,
        data.isDefault ? 1 : 0,
        data.userId
      ];

      // Log query parameters
      console.log('updateSupplierAddress params:', queryParams);

      // Call SP_ManageSupplierAddress
      const [results] = await pool.query(
        `CALL SP_ManageSupplierAddress(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_SupplierID_OUT, @p_AddressID_OUT, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('updateSupplierAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_SupplierID_OUT AS supplierId, @p_AddressID_OUT AS addressId, @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('updateSupplierAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageSupplierAddress');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update supplier-address linkage');
      }

      return {
        supplierId: output[0].supplierId,
        addressId: output[0].addressId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateSupplierAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a supplier, address, or supplier-address linkage
  static async deleteSupplierAddress(supplierId, addressId, userId) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        supplierId || null,
        addressId || null,
        null, // p_SupplierName
        null, // p_SupplierGroupID
        null, // p_SupplierTypeID
        null, // p_SupplierExportCode
        null, // p_SAPartner
        null, // p_SAPartnerExportCode
        null, // p_SupplierEmail
        null, // p_BillingCurrencyID
        null, // p_CompanyID
        null, // p_ExternalSupplierYN
        null, // p_AddressTitle
        null, // p_AddressName
        null, // p_AddressTypeID
        null, // p_AddressLine1
        null, // p_AddressLine2
        null, // p_City
        null, // p_County
        null, // p_State
        null, // p_PostalCode
        null, // p_Country
        null, // p_PreferredBillingAddress
        null, // p_PreferredShippingAddress
        null, // p_Longitude
        null, // p_Latitude
        null, // p_Disabled
        null, // p_IsDefault
        userId
      ];

      // Log query parameters
      console.log('deleteSupplierAddress params:', queryParams);

      // Call SP_ManageSupplierAddress
      const [results] = await pool.query(
        `CALL SP_ManageSupplierAddress(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_SupplierID_OUT, @p_AddressID_OUT, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('deleteSupplierAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_SupplierID_OUT AS supplierId, @p_AddressID_OUT AS addressId, @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('deleteSupplierAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageSupplierAddress');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete supplier-address linkage');
      }

      return {
        supplierId: output[0].supplierId,
        addressId: output[0].addressId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteSupplierAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = SupplierAddressModel;