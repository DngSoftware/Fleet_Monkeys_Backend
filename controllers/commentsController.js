const CommentsModel = require('../models/commentsModel');

class CommentsController {
  static async createComment(req, res) {
    try {
      const commentData = {
        ReferenceTable: req.body.ReferenceTable,
        ReferenceID: parseInt(req.body.ReferenceID),
        UserID: parseInt(req.user.personId), // From authMiddleware
        CommentText: req.body.CommentText
      };

      if (!commentData.ReferenceTable || isNaN(commentData.ReferenceID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ReferenceTable or ReferenceID',
          data: null,
          commentId: null
        });
      }

      if (!commentData.CommentText || commentData.CommentText.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'CommentText is required and cannot be empty',
          data: null,
          commentId: null
        });
      }

      const result = await CommentsModel.createComment(commentData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create comment error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        commentId: null
      });
    }
  }

  static async getCommentsByReference(req, res) {
    try {
      const referenceTable = req.params.referenceTable;
      const referenceID = parseInt(req.params.referenceID);

      if (!referenceTable || isNaN(referenceID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ReferenceTable or ReferenceID',
          data: null,
          commentId: null
        });
      }

      const result = await CommentsModel.getCommentsByReference(referenceTable, referenceID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get comments error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        commentId: null
      });
    }
  }
}

module.exports = CommentsController;