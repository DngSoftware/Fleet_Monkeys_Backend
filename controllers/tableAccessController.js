class TableAccessController {
  static async getAccessibleTables(req, res) {
    try {
      // Ensure accessibleTables is populated by tableAccessMiddleware
      if (!req.user || !req.user.accessibleTables) {
        return res.status(401).json({
          success: false,
          message: 'User data or table access information missing',
          data: null
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Accessible tables retrieved successfully (only tables with at least one permission are shown)',
        data: req.user.accessibleTables
      });
    } catch (error) {
      console.error('Get accessible tables error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null
      });
    }
  }
}

module.exports = TableAccessController;