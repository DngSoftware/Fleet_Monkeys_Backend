const poolPromise = require('../config/db.config');

const normalizeString = (str) => {
  if (!str || typeof str !== 'string') {
    return null;
  }
  let normalized = str.toLowerCase().replace(/[\s\-=]+/g, '');
  if (normalized === 'rolepermissions') {
    normalized = 'rolepermission';
  }
  if (normalized === 'tableaccess') {
    normalized = 'tableaccess';
  }
  return normalized;
};

const permissionMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.personId || !req.user.roleId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required or user data missing',
          data: null,
          permissionRoleId: null
        });
      }

      const roleId = parseInt(req.user.roleId);
      const personId = parseInt(req.user.personId);
      const roleName = req.user.role || '';

      let resourceName = req.baseUrl.split('/').pop();
      if (!resourceName || resourceName === 'api') {
        resourceName = req.path.split('/')[1] || 'unknown';
        console.warn(`Invalid resourceName from req.baseUrl, using fallback: ${resourceName}`);
      }

      const normalizedResourceName = normalizeString(resourceName);
      if (!normalizedResourceName) {
        return res.status(400).json({
          success: false,
          message: `Unable to determine resource name from route: ${req.baseUrl}`,
          data: null,
          permissionRoleId: null
        });
      }

      console.log('PermissionMiddleware: Normalized resource name:', normalizedResourceName);

      if (req.user.accessibleTables) {
        const tableAccess = [
          ...(req.user.accessibleTables.tables || []),
          ...(req.user.accessibleTables.masterTables || [])
        ].find(
          (table) => normalizeString(table.tableName) === normalizedResourceName
        );

        if (tableAccess) {
          console.log('PermissionMiddleware: Found table access in accessibleTables:', tableAccess);
          let hasPermission = false;
          switch (requiredPermission) {
            case 'read':
              hasPermission = tableAccess.permissions.read;
              break;
            case 'write':
              hasPermission = tableAccess.permissions.write;
              break;
            case 'update':
              hasPermission = tableAccess.permissions.update;
              break;
            case 'delete':
              hasPermission = tableAccess.permissions.delete;
              break;
            default:
              return res.status(400).json({
                success: false,
                message: 'Invalid permission type',
                data: null,
                permissionRoleId: null
              });
          }

          if (hasPermission) {
            console.log('PermissionMiddleware: Permission granted via accessibleTables');
            return next();
          } else {
            return res.status(403).json({
              success: false,
              message: `You do not have permission to ${requiredPermission} ${resourceName}`,
              data: null,
              permissionRoleId: null
            });
          }
        }
      }

      const pool = await poolPromise;
      if (!pool || typeof pool.query !== 'function') {
        throw new Error('Database pool is not initialized');
      }

      console.log('PermissionMiddleware: Querying dbo_tblpermission for TablePermission');
      const [permissionsList] = await pool.query(
        `SELECT TablePermission FROM dbo_tblpermission`
      );

      let matchedTablePermission = null;
      for (const { TablePermission } of permissionsList) {
        const normalizedTablePermission = normalizeString(TablePermission);
        if (normalizedTablePermission === normalizedResourceName) {
          matchedTablePermission = TablePermission;
          break;
        }
      }

      if (!matchedTablePermission) {
        return res.status(400).json({
          success: false,
          message: `No matching permission found for resource: ${resourceName}`,
          data: null,
          permissionRoleId: null
        });
      }

      console.log('PermissionMiddleware: Matched TablePermission:', matchedTablePermission);

      console.log('PermissionMiddleware: Querying dbo_tblrolepermission for permissions');
      const [permissions] = await pool.query(
        `
        SELECT rp.AllowRead, rp.AllowWrite, rp.AllowUpdate, rp.AllowDelete, p.IsMaster
        FROM dbo_tblrolepermission rp
        JOIN dbo_tblpermission p ON rp.PermissionID = p.PermissionID
        WHERE rp.RoleID = ?
        AND rp.PersonID = ?
        AND p.TablePermission = ?
        `,
        [roleId, personId, matchedTablePermission]
      );

      if (permissions.length === 0) {
        return res.status(403).json({
          success: false,
          message: `No permissions defined for this user for resource ${matchedTablePermission}`,
          data: null,
          permissionRoleId: null
        });
      }

      const permission = permissions[0];
      let hasPermission = false;
      switch (requiredPermission) {
        case 'read':
          hasPermission = permission.AllowRead === 1;
          break;
        case 'write':
          hasPermission = permission.AllowWrite === 1;
          break;
        case 'update':
          hasPermission = permission.AllowUpdate === 1;
          break;
        case 'delete':
          hasPermission = permission.AllowDelete === 1;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid permission type',
            data: null,
            permissionRoleId: null
          });
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${requiredPermission} ${matchedTablePermission}`,
          data: null,
          permissionRoleId: null
        });
      }

      console.log('PermissionMiddleware: Permission granted via database query');
      next();
    } catch (error) {
      console.error('PermissionMiddleware: Error:', {
        message: error.message,
        stack: error.stack,
        resourceName,
        roleId,
        personId
      });
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        permissionRoleId: null
      });
    }
  };
};

module.exports = permissionMiddleware;