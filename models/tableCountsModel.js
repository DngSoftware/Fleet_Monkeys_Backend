const poolPromise = require('../config/db.config');

class TableCountsModel {
  static async getTableCounts() {
    try {
      const pool = await poolPromise;
      const queries = [
        'SELECT COUNT(*) AS supplierCount FROM dbo_tblsupplier WHERE IsDeleted = 0',
        'SELECT COUNT(*) AS customerCount FROM dbo_tblcustomer WHERE IsDeleted = 0',
        'SELECT COUNT(*) AS vehicleCount FROM dbo_tblvehicle WHERE IsDeleted = 0',
        'SELECT COUNT(*) AS warehouseCount FROM dbo_tblwarehouse WHERE IsDeleted = 0'
      ];

      // Execute all queries in parallel
      const results = await Promise.all(queries.map(query => pool.query(query)));

      // Extract counts from results
      const counts = {
        suppliers: results[0][0][0].supplierCount,
        customers: results[1][0][0].customerCount,
        vehicles: results[2][0][0].vehicleCount,
        warehouses: results[3][0][0].warehouseCount
      };

      return {
        success: true,
        data: counts,
        message: 'Table counts retrieved successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = TableCountsModel;