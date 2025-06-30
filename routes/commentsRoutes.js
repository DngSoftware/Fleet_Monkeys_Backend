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

// Get all comments for a ReferenceTable and ReferenceID (requires read permission on Comments)
router.get('/:referenceTable/:referenceID', 
  authMiddleware, 
  tableAccessMiddleware, 
  permissionMiddleware('read'), 
  CommentsController.getCommentsByReference
);

module.exports = router;