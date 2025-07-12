const CommentsModel = require('../models/commentsModel');

class CommentsController {
  static async createComment(req, res) {
    try {
      const commentData = {
        SalesRFQID: parseInt(req.body.SalesRFQID),
        CreatedAtStage: req.body.CreatedAtStage,
        Comment: req.body.Comment,
        CreatedByID: parseInt(req.user.personId)
      };

      if (isNaN(commentData.SalesRFQID) || !commentData.CreatedAtStage || !commentData.Comment) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesRFQID, CreatedAtStage, or Comment',
          data: null,
          commentId: null
        });
      }

      if (commentData.Comment.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Comment is required and cannot be empty',
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

  static async updateComment(req, res) {
    try {
      const userCommentID = parseInt(req.params.userCommentID);
      const commentData = {
        Comment: req.body.Comment
      };
      const userId = parseInt(req.user.personId);

      if (isNaN(userCommentID) || !commentData.Comment) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing UserCommentID or Comment',
          data: null,
          commentId: null
        });
      }

      const result = await CommentsModel.updateComment(userCommentID, commentData, userId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update comment error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        commentId: null
      });
    }
  }

  static async getCommentsByStage(req, res) {
    try {
      const stage = req.params.stage;
      const salesRFQID = parseInt(req.params.salesRFQID);

      if (!stage || isNaN(salesRFQID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing CreatedAtStage or SalesRFQID',
          data: null,
          commentId: null
        });
      }

      const result = await CommentsModel.getCommentsByStage(stage, salesRFQID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get comments by stage error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        commentId: null
      });
    }
  }

  static async getCommentsBySalesRFQID(req, res) {
    try {
      const salesRFQID = parseInt(req.params.salesRFQID);

      if (isNaN(salesRFQID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesRFQID',
          data: null,
          commentId: null
        });
      }

      const result = await CommentsModel.getCommentsBySalesRFQID(salesRFQID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get comments by SalesRFQID error:', error);
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