const express = require('express');
const router = express.Router();
const CommentsController = require('../controllers/commentsController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Create a new comment (requires write permission on Comments)
router.post('/', 
  authMiddleware, 
  tableAccessMiddleware, 
  permissionMiddleware('write'), 
  CommentsController.createComment
);

// Update a comment (requires write permission on Comments and ownership)
router.put('/:userCommentID', 
  authMiddleware, 
  tableAccessMiddleware, 
  permissionMiddleware('update'), 
  CommentsController.updateComment
);

// Get all comments for a SalesRFQID across all stages (requires read permission on Comments)
router.get('/salesrfq/:salesRFQID', 
  authMiddleware, 
  tableAccessMiddleware, 
  permissionMiddleware('read'), 
  CommentsController.getCommentsBySalesRFQID
);

// Get all comments for a specific stage and SalesRFQID (requires read permission on Comments)
router.get('/:stage/:salesRFQID', 
  authMiddleware, 
  tableAccessMiddleware, 
  permissionMiddleware('read'), 
  CommentsController.getCommentsByStage
);

module.exports = router;