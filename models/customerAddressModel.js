const poolPromise = require('../config/db.config');

class CustomerAddressModel {
  // Create a new customer-address linkage
  static async createCustomerAddress(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        data.customerId || null,
        data.addressId || null,
        data.customerName,
        data.companyId,
        data.customerEmail,
        data.importCode,
        data.billingCurrencyId,
        data.website,
        data.customerNotes,
        data.isInQuickBooks ? 1 : 0,
        data.quickBookAccountId,
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
        data.createdById
      ];

      // Log query parameters
      console.log('createCustomerAddress params:', queryParams);

      // Call SP_ManageCustomerAddress
      const [results] = await pool.query(
        `CALL SP_ManageCustomerAddress(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_CustomerID_OUT, @p_AddressID_OUT, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('createCustomerAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_CustomerID_OUT AS customerId, @p_AddressID_OUT AS addressId, @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('createCustomerAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomerAddress');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create customer-address linkage');
      }

      return {
        customerId: output[0].customerId,
        addressId: output[0].addressId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createCustomerAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get all addresses for a customer
  static async getAllAddressesByCustomerId(customerId) {
    try {
      const pool = await poolPromise;

      // Validate customerId
      if (!customerId || isNaN(customerId)) {
        throw new Error('Valid CustomerID is required');
      }

      // Query to fetch all addresses for the customer
      const [results] = await pool.query(
        `SELECT 
            ca.AddressID,
            ca.CustomerID,
            ca.AddressTypeID,
            ca.IsDefault,
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
            ca.CreatedByID,
            ca.CreatedDateTime,
            ca.RowVersionColumn,
            c.CustomerName,
            c.CustomerEmail,
            c.CustomerAddressID
         FROM dbo_tblcustomeraddress ca
         LEFT JOIN dbo_tbladdresses a ON ca.AddressID = a.AddressID
         LEFT JOIN dbo_tbladdresstype at ON ca.AddressTypeID = at.AddressTypeID
         LEFT JOIN dbo_tblcustomer c ON ca.CustomerID = c.CustomerID
         WHERE ca.CustomerID = ?`,
        [customerId]
      );

      // Log results
      console.log('getAllAddressesByCustomerId results:', JSON.stringify(results, null, 2));

      return results;
    } catch (err) {
      console.error('getAllAddressesByCustomerId error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a customer-address linkage by CustomerID and AddressID
  static async getCustomerAddress(customerId, addressId) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        customerId,
        addressId,
        null, // p_CustomerName
        null, // p_CompanyID
        null, // p_CustomerEmail
        null, // p_ImportCode
        null, // p_BillingCurrencyID
        null, // p_Website
        null, // p_CustomerNotes
        null, // p_IsInQuickBooks
        null, // p_QuickBookAccountID
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
        null  // p_CreatedByID
      ];

      // Log query parameters
      console.log('getCustomerAddress params:', queryParams);

      // Call SP_ManageCustomerAddress
      const [results] = await pool.query(
        `CALL SP_ManageCustomerAddress(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_CustomerID_OUT, @p_AddressID_OUT, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('getCustomerAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_CustomerID_OUT AS customerId, @p_AddressID_OUT AS addressId, @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getCustomerAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomerAddress');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Customer-address linkage not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getCustomerAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a customer-address linkage
  static async updateCustomerAddress(customerId, addressId, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        customerId,
        addressId,
        data.customerName,
        data.companyId,
        data.customerEmail,
        data.importCode,
        data.billingCurrencyId,
        data.website,
        data.customerNotes,
        data.isInQuickBooks ? 1 : 0,
        data.quickBookAccountId,
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
        data.createdById
      ];

      // Log query parameters
      console.log('updateCustomerAddress params:', queryParams);

      // Call SP_ManageCustomerAddress
      const [results] = await pool.query(
        `CALL SP_ManageCustomerAddress(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_CustomerID_OUT, @p_AddressID_OUT, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('updateCustomerAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_CustomerID_OUT AS customerId, @p_AddressID_OUT AS addressId, @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('updateCustomerAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomerAddress');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update customer-address linkage');
      }

      return {
        customerId: output[0].customerId,
        addressId: output[0].addressId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateCustomerAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a customer, address, or customer-address linkage
  static async deleteCustomerAddress(customerId, addressId, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        customerId || null,
        addressId || null,
        null, // p_CustomerName
        null, // p_CompanyID
        null, // p_CustomerEmail
        null, // p_ImportCode
        null, // p_BillingCurrencyID
        null, // p_Website
        null, // p_CustomerNotes
        null, // p_IsInQuickBooks
        null, // p_QuickBookAccountID
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
        createdById
      ];

      // Log query parameters
      console.log('deleteCustomerAddress params:', queryParams);

      // Call SP_ManageCustomerAddress
      const [results] = await pool.query(
        `CALL SP_ManageCustomerAddress(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_CustomerID_OUT, @p_AddressID_OUT, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('deleteCustomerAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_CustomerID_OUT AS customerId, @p_AddressID_OUT AS addressId, @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('deleteCustomerAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomerAddress');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete customer-address linkage');
      }

      return {
        customerId: output[0].customerId,
        addressId: output[0].addressId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteCustomerAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = CustomerAddressModel;