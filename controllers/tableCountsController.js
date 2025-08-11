const TableCountsModel = require('../models/tableCountsModel');

class TableCountsController {
  static async getTableCounts(req, res) {
    try {
      const result = await TableCountsModel.getTableCounts();
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (err) {
      console.error('Error in getTableCounts:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }
}

module.exports = TableCountsController;