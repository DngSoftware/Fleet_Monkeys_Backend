const poolPromise = require('../config/db.config');

class RolePermissionModel {
  static async #validateForeignKeys(rolePermissionData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (rolePermissionData.PermissionID) {
        const [permissionCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblpermission WHERE PermissionID = ? AND IsDeleted = 0',
          [parseInt(rolePermissionData.PermissionID)]
        );
        if (permissionCheck.length === 0) errors.push(`PermissionID ${rolePermissionData.PermissionID} does not exist or is deleted`);
      }
      if (rolePermissionData.RoleID) {
        const [roleCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblroles WHERE RoleID = ? AND IsDeleted = 0',
          [parseInt(rolePermissionData.RoleID)]
        );
        if (roleCheck.length === 0) errors.push(`RoleID ${rolePermissionData.RoleID} does not exist or is deleted`);
      }
      if (rolePermissionData.PersonID) {
        const [personCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
          [parseInt(rolePermissionData.PersonID)]
        );
        if (personCheck.length === 0) errors.push(`PersonID ${rolePermissionData.PersonID} does not exist or is deleted`);
      }
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createRolePermission(rolePermissionData) {
    const requiredFields = ['PermissionID', 'RoleID'];
    const missingFields = requiredFields.filter(field => !rolePermissionData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        permissionRoleId: null
      };
    }

    const fkErrors = await this.#validateForeignKeys(rolePermissionData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        permissionRoleId: null
      };
    }

    try {
      const pool = await poolPromise;
      const query = `
        INSERT INTO dbo_tblrolepermission (
          PermissionID, RoleID, AllowRead, AllowWrite, AllowUpdate, AllowDelete, PersonID, IsMaster
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        parseInt(rolePermissionData.PermissionID),
        parseInt(rolePermissionData.RoleID),
        rolePermissionData.AllowRead != null ? Boolean(rolePermissionData.AllowRead) : null,
        rolePermissionData.AllowWrite != null ? Boolean(rolePermissionData.AllowWrite) : null,
        rolePermissionData.AllowUpdate != null ? Boolean(rolePermissionData.AllowUpdate) : null,
        rolePermissionData.AllowDelete != null ? Boolean(rolePermissionData.AllowDelete) : null,
        parseInt(rolePermissionData.PersonID) || null,
        rolePermissionData.IsMaster != null ? Boolean(rolePermissionData.IsMaster) : null
      ];

      const [result] = await pool.query(query, params);
      return {
        success: true,
        message: 'RolePermission created successfully',
        data: null,
        permissionRoleId: result.insertId
      };
    } catch (error) {
      console.error('Database error in INSERT operation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        permissionRoleId: null
      };
    }
  }

  static async updateRolePermission(rolePermissionData) {
    if (!rolePermissionData.PermissionRoleID) {
      return {
        success: false,
        message: 'PermissionRoleID is required for UPDATE',
        data: null,
        permissionRoleId: null
      };
    }

    const fkErrors = await this.#validateForeignKeys(rolePermissionData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        permissionRoleId: rolePermissionData.PermissionRoleID
      };
    }

    try {
      const pool = await poolPromise;
      const query = `
        UPDATE dbo_tblrolepermission
        SET
          PermissionID = ?,
          RoleID = ?,
          AllowRead = ?,
          AllowWrite = ?,
          AllowUpdate = ?,
          AllowDelete = ?,
          PersonID = ?,
          IsMaster = ?
        WHERE PermissionRoleID = ? AND IsDeleted = 0
      `;
      const params = [
        parseInt(rolePermissionData.PermissionID) || null,
        parseInt(rolePermissionData.RoleID) || null,
        rolePermissionData.AllowRead != null ? Boolean(rolePermissionData.AllowRead) : null,
        rolePermissionData.AllowWrite != null ? Boolean(rolePermissionData.AllowWrite) : null,
        rolePermissionData.AllowUpdate != null ? Boolean(rolePermissionData.AllowUpdate) : null,
        rolePermissionData.AllowDelete != null ? Boolean(rolePermissionData.AllowDelete) : null,
        parseInt(rolePermissionData.PersonID) || null,
        rolePermissionData.IsMaster != null ? Boolean(rolePermissionData.IsMaster) : null,
        parseInt(rolePermissionData.PermissionRoleID)
      ];

      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'RolePermission not found or already deleted',
          data: null,
          permissionRoleId: rolePermissionData.PermissionRoleID
        };
      }

      return {
        success: true,
        message: 'RolePermission updated successfully',
        data: null,
        permissionRoleId: rolePermissionData.PermissionRoleID
      };
    } catch (error) {
      console.error('Database error in UPDATE operation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        permissionRoleId: rolePermissionData.PermissionRoleID
      };
    }
  }

  static async deleteRolePermission(rolePermissionData) {
    if (!rolePermissionData.PermissionRoleID) {
      return {
        success: false,
        message: 'PermissionRoleID is required for DELETE',
        data: null,
        permissionRoleId: null
      };
    }

    try {
      const pool = await poolPromise;
      const query = `
        UPDATE dbo_tblrolepermission
        SET IsDeleted = 1, DeletedDateTime = NOW()
        WHERE PermissionRoleID = ? AND IsDeleted = 0
      `;
      const params = [
        parseInt(rolePermissionData.PermissionRoleID)
      ];

      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'RolePermission not found or already deleted',
          data: null,
          permissionRoleId: rolePermissionData.PermissionRoleID
        };
      }

      return {
        success: true,
        message: 'RolePermission deleted successfully',
        data: null,
        permissionRoleId: rolePermissionData.PermissionRoleID
      };
    } catch (error) {
      console.error('Database error in DELETE operation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        permissionRoleId: rolePermissionData.PermissionRoleID
      };
    }
  }

  static async getRolePermission(rolePermissionData) {
    if (!rolePermissionData.PermissionRoleID) {
      return {
        success: false,
        message: 'PermissionRoleID is required for SELECT',
        data: null,
        permissionRoleId: null
      };
    }

    try {
      const pool = await poolPromise;
      const query = `
        SELECT rp.*, p.TablePermission, r.RoleName,
               CONCAT(pers.FirstName, ' ', COALESCE(pers.MiddleName, ''), ' ', pers.LastName) AS PersonName
        FROM dbo_tblrolepermission rp
        LEFT JOIN dbo_tblpermission p ON rp.PermissionID = p.PermissionID AND p.IsDeleted = 0
        LEFT JOIN dbo_tblroles r ON rp.RoleID = r.RoleID AND r.IsDeleted = 0
        LEFT JOIN dbo_tblperson pers ON rp.PersonID = pers.PersonID AND pers.IsDeleted = 0
        WHERE rp.PermissionRoleID = ?
      `;
      const [result] = await pool.query(query, [parseInt(rolePermissionData.PermissionRoleID)]);

      if (result.length === 0) {
        return {
          success: false,
          message: 'RolePermission not found or deleted',
          data: null,
          permissionRoleId: rolePermissionData.PermissionRoleID
        };
      }

      return {
        success: true,
        message: 'RolePermission retrieved successfully',
        data: result[0],
        permissionRoleId: rolePermissionData.PermissionRoleID
      };
    } catch (error) {
      console.error('Database error in SELECT operation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        permissionRoleId: rolePermissionData.PermissionRoleID
      };
    }
  }

  static async getAllRolePermissions(paginationData) {
    try {
      const pool = await poolPromise;
      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;
      const offset = (pageNumber - 1) * pageSize;

      const query = `
        SELECT rp.*, p.TablePermission, r.RoleName,
               CONCAT(pers.FirstName, ' ', COALESCE(pers.MiddleName, ''), ' ', pers.LastName) AS PersonName
        FROM dbo_tblrolepermission rp
        LEFT JOIN dbo_tblpermission p ON rp.PermissionID = p.PermissionID AND p.IsDeleted = 0
        LEFT JOIN dbo_tblroles r ON rp.RoleID = r.RoleID AND r.IsDeleted = 0
        LEFT JOIN dbo_tblperson pers ON rp.PersonID = pers.PersonID AND pers.IsDeleted = 0
        LIMIT ? OFFSET ?
      `;
      const countQuery = `
        SELECT COUNT(*) AS totalRecords
        FROM dbo_tblrolepermission
      `;

      const [data] = await pool.query(query, [pageSize, offset]);
      const [[{ totalRecords }]] = await pool.query(countQuery);

      return {
        success: true,
        message: 'RolePermission records retrieved successfully',
        data: data || [],
        totalRecords: totalRecords || 0,
        permissionRoleId: null
      };
    } catch (error) {
      console.error('Database error in SELECT ALL operation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        permissionRoleId: null
      };
    }
  }
}

module.exports = RolePermissionModel;
