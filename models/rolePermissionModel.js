const poolPromise = require('../config/db.config');

class RolePermissionModel {
  static async #validateForeignKeys(rolePermissionData, action) {
    const pool = await poolPromise;
    if (!pool || typeof pool.query !== 'function') {
      throw new Error('Database pool is not initialized');
    }
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (rolePermissionData.PermissionID) {
        const [permissionCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblpermission WHERE PermissionID = ?',
          [parseInt(rolePermissionData.PermissionID)]
        );
        if (permissionCheck.length === 0) errors.push(`PermissionID ${rolePermissionData.PermissionID} does not exist`);
      }
      if (rolePermissionData.RoleID) {
        const [roleCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblroles WHERE RoleID = ?',
          [parseInt(rolePermissionData.RoleID)]
        );
        if (roleCheck.length === 0) errors.push(`RoleID ${rolePermissionData.RoleID} does not exist`);
      }
      if (rolePermissionData.PersonID) {
        const [personCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(rolePermissionData.PersonID)]
        );
        if (personCheck.length === 0) errors.push(`PersonID ${rolePermissionData.PersonID} does not exist`);
      }
      if (action === 'INSERT' && rolePermissionData.RoleID && rolePermissionData.PermissionID) {
        const [uniqueCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblrolepermission WHERE RoleID = ? AND PermissionID = ? AND (PersonID = ? OR (PersonID IS NULL AND ? IS NULL))',
          [
            parseInt(rolePermissionData.RoleID),
            parseInt(rolePermissionData.PermissionID),
            parseInt(rolePermissionData.PersonID) || null,
            parseInt(rolePermissionData.PersonID) || null
          ]
        );
        if (uniqueCheck.length > 0) errors.push(`Combination of RoleID ${rolePermissionData.RoleID}, PermissionID ${rolePermissionData.PermissionID}, and PersonID ${rolePermissionData.PersonID || 'NULL'} already exists`);
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
      if (!pool || typeof pool.query !== 'function') {
        throw new Error('Database pool is not initialized');
      }
      const query = `
        INSERT INTO dbo_tblrolepermission (
          PermissionID, RoleID, AllowRead, AllowWrite, AllowUpdate, AllowDelete, PersonID
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        parseInt(rolePermissionData.PermissionID),
        parseInt(rolePermissionData.RoleID),
        rolePermissionData.AllowRead != null ? Boolean(rolePermissionData.AllowRead) : null,
        rolePermissionData.AllowWrite != null ? Boolean(rolePermissionData.AllowWrite) : null,
        rolePermissionData.AllowUpdate != null ? Boolean(rolePermissionData.AllowUpdate) : null,
        rolePermissionData.AllowDelete != null ? Boolean(rolePermissionData.AllowDelete) : null,
        rolePermissionData.PersonID ? parseInt(rolePermissionData.PersonID) : null
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
      if (error.code === 'ER_DUP_ENTRY') {
        return {
          success: false,
          message: `Unique constraint violation: RoleID, PermissionID, and PersonID combination already exists`,
          data: null,
          permissionRoleId: null
        };
      }
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        permissionRoleId: null
      };
    }
  }

  static async createBulkRolePermissions(rolePermissionsArray) {
    if (!Array.isArray(rolePermissionsArray) || rolePermissionsArray.length === 0) {
      return {
        success: false,
        message: 'Input must be a non-empty array of role permission objects',
        data: null,
        permissionRoleIds: []
      };
    }

    const requiredFields = ['PermissionID', 'RoleID'];
    const results = [];
    const permissionRoleIds = [];
    const pool = await poolPromise;
    if (!pool || typeof pool.query !== 'function') {
      throw new Error('Database pool is not initialized');
    }

    try {
      await pool.query('START TRANSACTION');

      for (const rolePermissionData of rolePermissionsArray) {
        const missingFields = requiredFields.filter(field => !rolePermissionData[field]);
        if (missingFields.length > 0) {
          results.push({
            success: false,
            message: `${missingFields.join(', ')} are required`,
            permissionRoleId: null
          });
          continue;
        }

        const fkErrors = await this.#validateForeignKeys(rolePermissionData, 'INSERT');
        if (fkErrors) {
          results.push({
            success: false,
            message: `Validation failed: ${fkErrors}`,
            permissionRoleId: null
          });
          continue;
        }

        const query = `
          INSERT INTO dbo_tblrolepermission (
            PermissionID, RoleID, AllowRead, AllowWrite, AllowUpdate, AllowDelete, PersonID
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          parseInt(rolePermissionData.PermissionID),
          parseInt(rolePermissionData.RoleID),
          rolePermissionData.AllowRead != null ? Boolean(rolePermissionData.AllowRead) : null,
          rolePermissionData.AllowWrite != null ? Boolean(rolePermissionData.AllowWrite) : null,
          rolePermissionData.AllowUpdate != null ? Boolean(rolePermissionData.AllowUpdate) : null,
          rolePermissionData.AllowDelete != null ? Boolean(rolePermissionData.AllowDelete) : null,
          rolePermissionData.PersonID ? parseInt(rolePermissionData.PersonID) : null
        ];

        try {
          const [result] = await pool.query(query, params);
          permissionRoleIds.push(result.insertId);
          results.push({
            success: true,
            message: 'RolePermission created successfully',
            permissionRoleId: result.insertId
          });
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            results.push({
              success: false,
              message: `Unique constraint violation: RoleID ${rolePermissionData.RoleID}, PermissionID ${rolePermissionData.PermissionID}, PersonID ${rolePermissionData.PersonID || 'NULL'} already exists`,
              permissionRoleId: null
            });
            continue;
          }
          throw error; // Rethrow other errors to trigger rollback
        }
      }

      await pool.query('COMMIT');
      return {
        success: true,
        message: 'Bulk RolePermissions processed',
        data: results,
        permissionRoleIds
      };
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Database error in BULK INSERT operation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: results.length > 0 ? results : null,
        permissionRoleIds
      };
    }
  }

  static async updateRolePermission(rolePermissionData) {
    if (!rolePermissionData.PermissionRoleID) {
      return {
        success: false,
        message: 'PermissionRoleID is required for global role permission update',
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
      if (!pool || typeof pool.query !== 'function') {
        throw new Error('Database pool is not initialized');
      }
      const query = `
        UPDATE dbo_tblrolepermission
        SET
          PermissionID = ?,
          RoleID = ?,
          AllowRead = ?,
          AllowWrite = ?,
          AllowUpdate = ?,
          AllowDelete = ?,
          PersonID = ?
        WHERE PermissionRoleID = ?
      `;
      const params = [
        rolePermissionData.PermissionID ? parseInt(rolePermissionData.PermissionID) : null,
        rolePermissionData.RoleID ? parseInt(rolePermissionData.RoleID) : null,
        rolePermissionData.AllowRead != null ? Boolean(rolePermissionData.AllowRead) : null,
        rolePermissionData.AllowWrite != null ? Boolean(rolePermissionData.AllowWrite) : null,
        rolePermissionData.AllowUpdate != null ? Boolean(rolePermissionData.AllowUpdate) : null,
        rolePermissionData.AllowDelete != null ? Boolean(rolePermissionData.AllowDelete) : null,
        rolePermissionData.PersonID ? parseInt(rolePermissionData.PersonID) : null,
        parseInt(rolePermissionData.PermissionRoleID)
      ];

      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'RolePermission not found',
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
      if (error.code === 'ER_DUP_ENTRY') {
        return {
          success: false,
          message: `Unique constraint violation: RoleID, PermissionID, and PersonID combination already exists`,
          data: null,
          permissionRoleId: rolePermissionData.PermissionRoleID
        };
      }
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        permissionRoleId: rolePermissionData.PermissionRoleID
      };
    }
  }

  static async updateRolePermissionsByRoleId(roleId, permissionData) {
    if (!roleId) {
      return {
        success: false,
        message: 'RoleID is required for bulk update',
        data: null,
        updatedCount: 0
      };
    }

    try {
      const pool = await poolPromise;
      if (!pool || typeof pool.query !== 'function') {
        throw new Error('Database pool is not initialized');
      }

      // Validate RoleID
      const [roleCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblroles WHERE RoleID = ?',
        [parseInt(roleId)]
      );
      if (roleCheck.length === 0) {
        return {
          success: false,
          message: `RoleID ${roleId} does not exist`,
          data: null,
          updatedCount: 0
        };
      }

      const query = `
        UPDATE dbo_tblrolepermission
        SET
          AllowRead = ?,
          AllowWrite = ?,
          AllowUpdate = ?,
          AllowDelete = ?
        WHERE RoleID = ?
      `;
      const params = [
        permissionData.AllowRead != null ? Boolean(permissionData.AllowRead) : null,
        permissionData.AllowWrite != null ? Boolean(permissionData.AllowWrite) : null,
        permissionData.AllowUpdate != null ? Boolean(permissionData.AllowUpdate) : null,
        permissionData.AllowDelete != null ? Boolean(permissionData.AllowDelete) : null,
        parseInt(roleId)
      ];

      await pool.query('START TRANSACTION');
      const [result] = await pool.query(query, params);
      await pool.query('COMMIT');

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'No role permissions found for the specified RoleID',
          data: null,
          updatedCount: 0
        };
      }

      return {
        success: true,
        message: `Updated ${result.affectedRows} role permissions successfully`,
        data: null,
        updatedCount: result.affectedRows
      };
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Database error in BULK UPDATE by RoleID operation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        updatedCount: 0
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
      if (!pool || typeof pool.query !== 'function') {
        throw new Error('Database pool is not initialized');
      }
      const query = `
        DELETE FROM dbo_tblrolepermission
        WHERE PermissionRoleID = ?
      `;
      const params = [
        parseInt(rolePermissionData.PermissionRoleID)
      ];

      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'RolePermission not found',
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
      if (!pool || typeof pool.query !== 'function') {
        throw new Error('Database pool is not initialized');
      }
      const query = `
        SELECT rp.*, p.TablePermission, p.IsMaster, r.RoleName,
               CONCAT(pers.FirstName, ' ', COALESCE(pers.MiddleName, ''), ' ', pers.LastName) AS PersonName
        FROM dbo_tblrolepermission rp
        LEFT JOIN dbo_tblpermission p ON rp.PermissionID = p.PermissionID
        LEFT JOIN dbo_tblroles r ON rp.RoleID = r.RoleID
        LEFT JOIN dbo_tblperson pers ON rp.PersonID = pers.PersonID
        WHERE rp.PermissionRoleID = ?
      `;
      const [result] = await pool.query(query, [parseInt(rolePermissionData.PermissionRoleID)]);

      if (result.length === 0) {
        return {
          success: false,
          message: 'RolePermission not found',
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
      if (!pool || typeof pool.query !== 'function') {
        throw new Error('Database pool is not initialized');
      }
      const pageNumber = Math.max(1, parseInt(paginationData.PageNumber) || 1);
      const pageSize = Math.max(1, Math.min(100, parseInt(paginationData.PageSize) || 10));
      const sortBy = paginationData.SortBy && ['PermissionRoleID', 'RoleID', 'PermissionID'].includes(paginationData.SortBy) ? paginationData.SortBy : 'PermissionRoleID';
      const sortOrder = paginationData.SortOrder && ['ASC', 'DESC'].includes(paginationData.SortOrder.toUpperCase()) ? paginationData.SortOrder.toUpperCase() : 'ASC';
      const offset = (pageNumber - 1) * pageSize;

      const query = `
        SELECT rp.*, p.TablePermission, p.IsMaster, r.RoleName,
               CONCAT(pers.FirstName, ' ', COALESCE(pers.MiddleName, ''), ' ', pers.LastName) AS PersonName
        FROM dbo_tblrolepermission rp
        LEFT JOIN dbo_tblpermission p ON rp.PermissionID = p.PermissionID
        LEFT JOIN dbo_tblroles r ON rp.RoleID = r.RoleID
        LEFT JOIN dbo_tblperson pers ON rp.PersonID = pers.PersonID
        ORDER BY ${sortBy} ${sortOrder}
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
        totalPages: Math.ceil(totalRecords / pageSize),
        currentPage: pageNumber,
        pageSize: pageSize,
        permissionRoleId: null
      };
    } catch (error) {
      console.error('Database error in SELECT ALL operation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        permissionRoleId: null
      };
    }
  }

  static async getRolePermissionsByRoleId(roleId, paginationData) {
    if (!roleId) {
      return {
        success: false,
        message: 'RoleID is required for SELECT',
        data: null,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        personCount: 0
      };
    }

    try {
      const pool = await poolPromise;
      if (!pool || typeof pool.query !== 'function') {
        throw new Error('Database pool is not initialized');
      }

      // Validate RoleID
      const [roleCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblroles WHERE RoleID = ?',
        [parseInt(roleId)]
      );
      if (roleCheck.length === 0) {
        return {
          success: false,
          message: `RoleID ${roleId} does not exist`,
          data: null,
          totalRecords: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          personCount: 0
        };
      }

      const pageNumber = Math.max(1, parseInt(paginationData.PageNumber) || 1);
      const pageSize = Math.max(1, Math.min(100, parseInt(paginationData.PageSize) || 10));
      const sortBy = paginationData.SortBy && ['PermissionRoleID', 'PermissionID', 'PersonID'].includes(paginationData.SortBy) ? paginationData.SortBy : 'PermissionRoleID';
      const sortOrder = paginationData.SortOrder && ['ASC', 'DESC'].includes(paginationData.SortOrder.toUpperCase()) ? paginationData.SortOrder.toUpperCase() : 'ASC';
      const offset = (pageNumber - 1) * pageSize;

      const query = `
        SELECT rp.*, p.TablePermission, p.IsMaster, r.RoleName,
               CONCAT(pers.FirstName, ' ', COALESCE(pers.MiddleName, ''), ' ', pers.LastName) AS PersonName
        FROM dbo_tblrolepermission rp
        LEFT JOIN dbo_tblpermission p ON rp.PermissionID = p.PermissionID
        LEFT JOIN dbo_tblroles r ON rp.RoleID = r.RoleID
        LEFT JOIN dbo_tblperson pers ON rp.PersonID = pers.PersonID
        WHERE rp.RoleID = ?
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      const countQuery = `
        SELECT COUNT(*) AS totalRecords, COUNT(DISTINCT rp.PersonID) AS personCount
        FROM dbo_tblrolepermission rp
        WHERE rp.RoleID = ?
      `;

      const [data] = await pool.query(query, [parseInt(roleId), pageSize, offset]);
      const [[{ totalRecords, personCount }]] = await pool.query(countQuery, [parseInt(roleId)]);

      return {
        success: true,
        message: 'Role permissions retrieved successfully',
        data: data || [],
        totalRecords: totalRecords || 0,
        totalPages: Math.ceil(totalRecords / pageSize),
        currentPage: pageNumber,
        pageSize: pageSize,
        personCount: personCount || 0
      };
    } catch (error) {
      console.error('Database error in SELECT by RoleID operation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        personCount: 0
      };
    }
  }
}

module.exports = RolePermissionModel;