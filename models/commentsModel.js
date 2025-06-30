const poolPromise = require('../config/db.config');

class CommentsModel {
  // Supported tables and their primary keys
  static #validTables = {
    salesrfq: 'SalesRFQID',
    purchaserfq: 'PurchaseRFQID',
    supplierquotation: 'SupplierQuotationID',
    salesquotation: 'SalesQuotationID',
    salesorder: 'SalesOrderID',
    po: 'POID',
    pinvoice: 'PInvoiceID',
    salesinvoice: 'SalesInvoiceID'
  };

  static async createComment(commentData) {
    try {
      const { ReferenceTable, ReferenceID, UserID, CommentText } = commentData;

      // Validate required fields
      const requiredFields = ['ReferenceTable', 'ReferenceID', 'UserID', 'CommentText'];
      const missingFields = requiredFields.filter(field => !commentData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          commentId: null
        };
      }

      // Validate ReferenceTable
      const tableKey = ReferenceTable.toLowerCase();
      if (!this.#validTables[tableKey]) {
        return {
          success: false,
          message: `Invalid ReferenceTable: ${ReferenceTable}. Must be one of: ${Object.keys(this.#validTables).join(', ')}`,
          data: null,
          commentId: null
        };
      }

      // Validate ReferenceID and UserID
      const pool = await poolPromise;
      const tableName = `dbo_tbl${tableKey}`;
      const primaryKey = this.#validTables[tableKey];
      const [recordCheck] = await pool.query(
        `SELECT 1 FROM \`${tableName}\` WHERE \`${primaryKey}\` = ? AND \`IsDeleted\` = 0`,
        [parseInt(ReferenceID)]
      );
      if (recordCheck.length === 0) {
        return {
          success: false,
          message: `${primaryKey} ${ReferenceID} does not exist or is deleted in ${ReferenceTable}`,
          data: null,
          commentId: null
        };
      }

      const [userCheck] = await pool.query(
        'SELECT 1 FROM `dbo_tblperson` WHERE `PersonID` = ? AND `IsDeleted` = 0',
        [parseInt(UserID)]
      );
      if (userCheck.length === 0) {
        return {
          success: false,
          message: `UserID ${UserID} does not exist or is deleted`,
          data: null,
          commentId: null
        };
      }

      // Prepare insert query with dynamic foreign key column
      const insertFields = ['UserID', 'CommentText', 'IsDeleted', primaryKey];
      const insertValues = [parseInt(UserID), CommentText, 0, parseInt(ReferenceID)];
      const placeholders = insertFields.map(() => '?').join(', ');
      const insertQuery = `INSERT INTO \`dbo_tblcomments\` (\`${insertFields.join('`, `')}\`, \`CreatedDateTime\`) VALUES (${placeholders}, CURRENT_TIMESTAMP);`;

      // Insert comment and get CommentID
      const [result] = await pool.query(
        `${insertQuery} SELECT LAST_INSERT_ID() AS CommentID;`,
        insertValues
      );

      const commentId = result[0]?.CommentID;

      return {
        success: true,
        message: 'Comment created successfully',
        data: {
          CommentID: commentId,
          [primaryKey]: ReferenceID,
          UserID,
          CommentText,
          CreatedDateTime: new Date()
        },
        commentId
      };
    } catch (error) {
      console.error('Create comment error:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        commentId: null
      };
    }
  }

  static async getCommentsByReference(referenceTable, referenceID) {
    try {
      // Validate inputs
      if (!referenceTable || !referenceID) {
        return {
          success: false,
          message: 'ReferenceTable and ReferenceID are required',
          data: null,
          commentId: null
        };
      }

      // Validate ReferenceTable
      const tableKey = referenceTable.toLowerCase();
      if (!this.#validTables[tableKey]) {
        return {
          success: false,
          message: `Invalid ReferenceTable: ${referenceTable}. Must be one of: ${Object.keys(this.#validTables).join(', ')}`,
          data: null,
          commentId: null
        };
      }

      const primaryKey = this.#validTables[tableKey];
      const pool = await poolPromise;
      const [comments] = await pool.query(
        `SELECT c.\`CommentID\`, c.\`${primaryKey}\` AS ReferenceID, c.\`UserID\`, p.\`FirstName\`, p.\`LastName\`, p.\`ProfileImage\`, c.\`CommentText\`, c.\`CreatedDateTime\`
         FROM \`dbo_tblcomments\` c
         JOIN \`dbo_tblperson\` p ON c.\`UserID\` = p.\`PersonID\`
         WHERE c.\`${primaryKey}\` = ? AND c.\`IsDeleted\` = 0 AND p.\`IsDeleted\` = 0
         ORDER BY c.\`CreatedDateTime\` DESC`,
        [parseInt(referenceID)]
      );

      return {
        success: true,
        message: 'Comments retrieved successfully',
        data: comments.map(comment => ({
          ...comment,
          ReferenceTable: referenceTable
        })),
        commentId: null
      };
    } catch (error) {
      console.error('Get comments error:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        commentId: null
      };
    }
  }
}

module.exports = CommentsModel;