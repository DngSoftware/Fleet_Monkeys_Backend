const poolPromise = require('../config/db.config');

class SubscriptionPlanModel {
  static async getAllSubscriptionPlans({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1) pageSize = 10;
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
        formattedFromDate ? formattedFromDate.toISOString() : null,
        formattedToDate ? formattedToDate.toISOString() : null
      ];

      // Log query parameters
      console.log('getAllSubscriptionPlans params:', queryParams);

      // Call SP_GetAllSubscriptionPlans
      const [results] = await pool.query(
        'CALL SP_GetAllSubscriptionPlans(?, ?, ?, ?)',
        queryParams
      );

      // Log results
      console.log('getAllSubscriptionPlans results:', JSON.stringify(results, null, 2));

      // Extract paginated data and total count
      const subscriptionPlans = results[0] || [];
      const totalRecords = results[1] && results[1][0] ? results[1][0].TotalRecords : 0;

      return {
        data: subscriptionPlans,
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllSubscriptionPlans error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async createSubscriptionPlan(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_SubscriptionPlanID
        data.subscriptionPlanName,
        data.description,
        data.fees,
        data.billingFrequencyId,
        data.createdById,
        null // p_DeletedByID
      ];

      console.log('createSubscriptionPlan params:', queryParams);

      await pool.query(
        'CALL SP_ManageSubscriptionPlan(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_SubscriptionPlanID AS p_SubscriptionPlanID');

      console.log('createSubscriptionPlan output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageSubscriptionPlan');
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to create Subscription Plan');
      }

      return {
        subscriptionPlanId: output[0].p_SubscriptionPlanID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createSubscriptionPlan error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async getSubscriptionPlanById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_SubscriptionPlanName
        null, // p_Description
        null, // p_Fees
        null, // p_BillingFrequencyID
        null, // p_CreatedByID
        null  // p_DeletedByID
      ];

      console.log('getSubscriptionPlanById params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageSubscriptionPlan(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getSubscriptionPlanById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getSubscriptionPlanById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageSubscriptionPlan');
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Subscription Plan not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getSubscriptionPlanById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async updateSubscriptionPlan(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.subscriptionPlanName,
        data.description,
        data.fees,
        data.billingFrequencyId,
        data.createdById,
        null // p_DeletedByID
      ];

      console.log('updateSubscriptionPlan params:', queryParams);

      await pool.query(
        'CALL SP_ManageSubscriptionPlan(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('updateSubscriptionPlan output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageSubscriptionPlan');
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to update Subscription Plan');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateSubscriptionPlan error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async deleteSubscriptionPlan(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_SubscriptionPlanName
        null, // p_Description
        null, // p_Fees
        null, // p_BillingFrequencyID
        null, // p_CreatedByID
        deletedById
      ];

      console.log('deleteSubscriptionPlan params:', queryParams);

      await pool.query(
        'CALL SP_ManageSubscriptionPlan(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteSubscriptionPlan output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageSubscriptionPlan');
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to delete Subscription Plan');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteSubscriptionPlan error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = SubscriptionPlanModel;