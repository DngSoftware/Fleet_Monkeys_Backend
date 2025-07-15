const poolPromise = require('../config/db.config');

const tableAccessMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.personId || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required or user data missing',
        data: null,
        permissionRoleId: null
      });
    }

    let roleId = req.user.roleId;
    if (req.query.roleId) {
      roleId = parseInt(req.query.roleId);
      if (isNaN(roleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid roleId provided',
          data: null,
          permissionRoleId: null
        });
      }
    }

    if (!roleId) {
      return res.status(401).json({
        success: false,
        message: 'Role ID missing for the user',
        data: null,
        permissionRoleId: null
      });
    }

    const personId = parseInt(req.user.personId);
    const pool = await poolPromise;
    if (!pool || typeof pool.query !== 'function') {
      throw new Error('Database pool is not initialized');
    }

    const [rolePermissions] = await pool.query(
      `SELECT p.TablePermission, rp.AllowRead, rp.AllowWrite, rp.AllowUpdate, rp.AllowDelete, p.IsMaster
       FROM dbo_tblrolepermission rp
       JOIN dbo_tblpermission p ON rp.PermissionID = p.PermissionID
       WHERE rp.RoleID = ?
       AND rp.PersonID = ?`,
      [roleId, personId]
    );

    const accessibleTables = rolePermissions
      .map(permission => ({
        tableName: permission.TablePermission,
        permissions: {
          read: permission.AllowRead === 1,
          write: permission.AllowWrite === 1,
          update: permission.AllowUpdate === 1,
          delete: permission.AllowDelete === 1
        },
        isMaster: permission.IsMaster === 1
      }))
      .filter(table => 
        table.permissions.read || 
        table.permissions.write || 
        table.permissions.update || 
        table.permissions.delete
      );

    const masterTables = accessibleTables
      .filter(table => table.isMaster)
      .map(({ tableName, permissions }) => ({
        tableName,
        permissions
      }));

    const nonMasterTables = accessibleTables
      .filter(table => !table.isMaster)
      .map(({ tableName, permissions }) => ({
        tableName,
        permissions
      }));

    req.user.accessibleTables = {
      tables: nonMasterTables,
      masterTables
    };

    if (!req.user.accessibleTables.tables || (req.user.accessibleTables.tables.length === 0 && req.user.accessibleTables.masterTables.length === 0)) {
      return res.status(403).json({
        success: false,
        message: 'No tables accessible for this role and user',
        data: null,
        permissionRoleId: null
      });
    }

    next();
  } catch (error) {
    console.error('Table access middleware error:', {
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
};

module.exports = tableAccessMiddleware;