class TableAccessController {
  static async getAccessibleTables(req, res) {
    try {
      if (!req.user || !req.user.accessibleTables) {
        return res.status(401).json({
          success: false,
          message: 'User data or table access information missing',
          data: null,
          permissionRoleId: null
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Accessible tables retrieved successfully (only tables with at least one permission are shown)',
        data: req.user.accessibleTables,
        permissionRoleId: null
      });
    } catch (error) {
      console.error('Get accessible tables error:', {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        permissionRoleId: null
      });
    }
  }
}

module.exports = TableAccessController;