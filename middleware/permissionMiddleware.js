const poolPromise = require("../config/db.config");

// Helper function to normalize a string (remove spaces, special characters, and convert to lowercase)
const normalizeString = (str) => {
  let normalized = str.toLowerCase().replace(/[\s\-=]+/g, "");
  // Special case for rolepermissions
  if (normalized === "rolepermissions") {
    normalized = "rolepermission"; // Match dbo_tblpermission TablePermission value
  }
  return normalized;
};

const permissionMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.personId || !req.user.roleId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required or user data missing",
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      const roleId = parseInt(req.user.roleId);
      const personId = parseInt(req.user.personId);
      const roleName = req.user.role || "";

      // Extract resource name from the route path (e.g., "/api/salesrfq" -> "salesrfq")
      let resourceName = req.baseUrl.split("/").pop();
      if (!resourceName) {
        return res.status(400).json({
          success: false,
          message: "Unable to determine resource name from route",
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      // Normalize the resource name
      const normalizedResourceName = normalizeString(resourceName);
      console.log(
        "Normalized resource name from route:",
        normalizedResourceName
      ); // For debugging

      // Check if accessibleTables is populated by tableAccessMiddleware
      if (req.user.accessibleTables) {
        // Search both tables and masterTables arrays
        const tableAccess = [
          ...(req.user.accessibleTables.tables || []),
          ...(req.user.accessibleTables.masterTables || [])
        ].find(
          (table) => normalizeString(table.tableName) === normalizedResourceName
        );

        if (tableAccess) {
          let hasPermission = false;
          switch (requiredPermission) {
            case "read":
              hasPermission = tableAccess.permissions.read;
              break;
            case "write":
              hasPermission = tableAccess.permissions.write;
              break;
            case "update":
              hasPermission = tableAccess.permissions.update;
              break;
            case "delete":
              hasPermission = tableAccess.permissions.delete;
              break;
            default:
              return res.status(400).json({
                success: false,
                message: "Invalid permission type",
                data: null,
                salesRFQId: null,
                newSalesRFQId: null,
              });
          }

          if (hasPermission) {
            return next(); // Permission granted, skip database query
          } else {
            return res.status(403).json({
              success: false,
              message: `You do not have permission to ${requiredPermission} ${resourceName}`,
              data: null,
              salesRFQId: null,
              newSalesRFQId: null,
            });
          }
        }
      }

      // If accessibleTables is not available or table is not found, fall back to database query
      const pool = await poolPromise;

      // Get all PermissionNames from dbo_tblpermission
      const [permissionsList] = await pool.query(
        `SELECT TablePermission FROM dbo_tblpermission WHERE IsDeleted = 0`
      );

      // Find the matching PermissionName
      let matchedTablePermission = null;
      for (const { TablePermission } of permissionsList) {
        const normalizedTablePermission = normalizeString(TablePermission);
        if (normalizedTablePermission === normalizedResourceName) {
          matchedTablePermission = TablePermission; // Use the original PermissionName for the query
          break;
        }
      }

      if (!matchedTablePermission) {
        return res.status(400).json({
          success: false,
          message: `No matching permission found for resource: ${resourceName}`,
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      console.log("Matched TablePermission:", matchedTablePermission); // For debugging

      // Use the matched PermissionName for the permission check
      // Only check for user-specific permissions (PersonID = ?), ignore role-level permissions (PersonID IS NULL)
      const [permissions] = await pool.query(
        `
        SELECT AllowRead, AllowWrite, AllowUpdate, AllowDelete
        FROM dbo_tblrolepermission
        WHERE RoleID = ?
        AND PersonID = ?  -- Only match user-specific permissions
        AND PermissionID = (
          SELECT PermissionID FROM dbo_tblpermission 
          WHERE TablePermission = ? AND IsDeleted = 0
        )
        `,
        [roleId, personId, matchedTablePermission]
      );

      if (permissions.length === 0) {
        return res.status(403).json({
          success: false,
          message: `No permissions defined for this user for resource ${matchedTablePermission}`,
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      const permission = permissions[0];
      let hasPermission = false;
      switch (requiredPermission) {
        case "read":
          hasPermission = permission.AllowRead === 1;
          break;
        case "write":
          hasPermission = permission.AllowWrite === 1;
          break;
        case "update":
          hasPermission = permission.AllowUpdate === 1;
          break;
        case "delete":
          hasPermission = permission.AllowDelete === 1;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid permission type",
            data: null,
            salesRFQId: null,
            newSalesRFQId: null,
          });
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${requiredPermission} ${matchedTablePermission}`,
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
      });
    }
  };
};

module.exports = permissionMiddleware;