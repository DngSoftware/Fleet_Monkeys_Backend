const poolPromise = require('../config/db.config');

class CommentsModel {
  static #validStages = [
    'salesrfq',
    'purchaserfq',
    'supplierquotation',
    'salesquotation',
    'salesorder',
    'po',
    'pinvoice',
    'salesinvoice'
  ];

  static async createComment(commentData) {
    try {
      const { SalesRFQID, CreatedAtStage, Comment, CreatedByID } = commentData;

      // Validate required fields
      const requiredFields = ['SalesRFQID', 'CreatedAtStage', 'Comment', 'CreatedByID'];
      const missingFields = requiredFields.filter(field => commentData[field] === undefined || commentData[field] === null);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          commentId: null
        };
      }

      // Validate CreatedAtStage
      const stageKey = CreatedAtStage.toLowerCase();
      if (!this.#validStages.includes(stageKey)) {
        return {
          success: false,
          message: `Invalid CreatedAtStage: ${CreatedAtStage}. Must be one of: ${this.#validStages.join(', ')}`,
          data: null,
          commentId: null
        };
      }

      // Validate SalesRFQID and CreatedByID
      const pool = await poolPromise;
      const [rfqCheck] = await pool.query(
        'SELECT 1 FROM `dbo_tblsalesrfq` WHERE `SalesRFQID` = ?',
        [parseInt(SalesRFQID)]
      );
      if (rfqCheck.length === 0) {
        return {
          success: false,
          message: `SalesRFQID ${SalesRFQID} does not exist`,
          data: null,
          commentId: null
        };
      }

      const [userCheck] = await pool.query(
        'SELECT 1 FROM `dbo_tblperson` WHERE `PersonID` = ?',
        [parseInt(CreatedByID)]
      );
      if (userCheck.length === 0) {
        return {
          success: false,
          message: `CreatedByID ${CreatedByID} does not exist`,
          data: null,
          commentId: null
        };
      }

      // Insert comment
      const insertQuery = `
        INSERT INTO \`dbo_tblusercomments\` (\`SalesRFQID\`, \`CreatedAtStage\`, \`Comment\`, \`CreatedByID\`, \`CreatedDateTime\`)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);
      `;
      const [result] = await pool.query(insertQuery, [
        parseInt(SalesRFQID),
        stageKey,
        Comment,
        parseInt(CreatedByID)
      ]);

      const commentId = result.insertId;

      return {
        success: true,
        message: 'Comment created successfully',
        data: {
          UserCommentID: commentId,
          SalesRFQID,
          CreatedAtStage: stageKey,
          Comment,
          CreatedByID,
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

  static async updateComment(userCommentID, commentData, userId) {
    try {
      const { Comment } = commentData;

      // Validate required fields
      if (!Comment || Comment.trim() === '') {
        return {
          success: false,
          message: 'Comment is required and cannot be empty',
          data: null,
          commentId: null
        };
      }

      // Validate UserCommentID and ownership
      const pool = await poolPromise;
      const [commentCheck] = await pool.query(
        'SELECT `CreatedByID` FROM `dbo_tblusercomments` WHERE `UserCommentID` = ?',
        [parseInt(userCommentID)]
      );
      if (commentCheck.length === 0) {
        return {
          success: false,
          message: `Comment with UserCommentID ${userCommentID} does not exist`,
          data: null,
          commentId: null
        };
      }
      if (commentCheck[0].CreatedByID !== parseInt(userId)) {
        return {
          success: false,
          message: 'You are not authorized to update this comment',
          data: null,
          commentId: null
        };
      }

      // Update comment
      const updateQuery = `
        UPDATE \`dbo_tblusercomments\`
        SET \`Comment\` = ?
        WHERE \`UserCommentID\` = ?;
      `;
      await pool.query(updateQuery, [Comment, parseInt(userCommentID)]);

      // Fetch updated comment
      const [updatedComment] = await pool.query(
        `SELECT c.\`UserCommentID\`, c.\`SalesRFQID\`, c.\`CreatedAtStage\`, c.\`Comment\`, c.\`CreatedByID\`,
                p.\`FirstName\`, p.\`LastName\`, p.\`ProfileImage\`, c.\`CreatedDateTime\`
         FROM \`dbo_tblusercomments\` c
         JOIN \`dbo_tblperson\` p ON c.\`CreatedByID\` = p.\`PersonID\`
         WHERE c.\`UserCommentID\` = ?`,
        [parseInt(userCommentID)]
      );

      return {
        success: true,
        message: 'Comment updated successfully',
        data: updatedComment[0],
        commentId: parseInt(userCommentID)
      };
    } catch (error) {
      console.error('Update comment error:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        commentId: null
      };
    }
  }

  static async getCommentsByStage(stage, salesRFQID) {
    try {
      console.log(`Fetching comments for Stage: ${stage}, SalesRFQID: ${salesRFQID}`);
      if (!stage || !salesRFQID) {
        return {
          success: false,
          message: 'CreatedAtStage and SalesRFQID are required',
          data: null,
          commentId: null
        };
      }

      const stageKey = stage.toLowerCase();
      if (!this.#validStages.includes(stageKey)) {
        return {
          success: false,
          message: `Invalid CreatedAtStage: ${stage}. Must be one of: ${this.#validStages.join(', ')}`,
          data: null,
          commentId: null
        };
      }

      const pool = await poolPromise;
      const [comments] = await pool.query(
        `SELECT c.\`UserCommentID\`, c.\`SalesRFQID\`, c.\`CreatedAtStage\`, c.\`Comment\`, c.\`CreatedByID\`,
                p.\`FirstName\`, p.\`LastName\`, p.\`ProfileImage\`, c.\`CreatedDateTime\`
         FROM \`dbo_tblusercomments\` c
         JOIN \`dbo_tblperson\` p ON c.\`CreatedByID\` = p.\`PersonID\`
         WHERE c.\`CreatedAtStage\` = ? AND c.\`SalesRFQID\` = ?
         ORDER BY c.\`CreatedDateTime\` DESC`,
        [stageKey, parseInt(salesRFQID)]
      );

      return {
        success: true,
        message: 'Comments retrieved successfully',
        data: comments,
        commentId: null
      };
    } catch (error) {
      console.error('Get comments by stage error:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        commentId: null
      };
    }
  }

  static async getCommentsBySalesRFQID(salesRFQID) {
    try {
      console.log(`Fetching comments for SalesRFQID: ${salesRFQID}`);
      if (!salesRFQID) {
        return {
          success: false,
          message: 'SalesRFQID is required',
          data: null,
          commentId: null
        };
      }

      const pool = await poolPromise;
      const [comments] = await pool.query(
        `SELECT c.\`UserCommentID\`, c.\`SalesRFQID\`, c.\`CreatedAtStage\`, c.\`Comment\`, c.\`CreatedByID\`,
                p.\`FirstName\`, p.\`LastName\`, p.\`ProfileImage\`, c.\`CreatedDateTime\`
         FROM \`dbo_tblusercomments\` c
         JOIN \`dbo_tblperson\` p ON c.\`CreatedByID\` = p.\`PersonID\`
         WHERE c.\`SalesRFQID\` = ?
         ORDER BY c.\`CreatedDateTime\` DESC`,
        [parseInt(salesRFQID)]
      );

      return {
        success: true,
        message: 'Comments retrieved successfully for SalesRFQID',
        data: comments,
        commentId: null
      };
    } catch (error) {
      console.error('Get comments by SalesRFQID error:', error);
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