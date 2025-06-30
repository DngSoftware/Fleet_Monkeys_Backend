const express = require('express');
const router = express.Router();
const MailingPriorityController = require('../controllers/mailingPriorityController');

router.get('/', MailingPriorityController.getAllMailingPriorities);
router.post('/', MailingPriorityController.createMailingPriority);
router.get('/:id', MailingPriorityController.getMailingPriorityById);
router.put('/:id', MailingPriorityController.updateMailingPriority);
router.delete('/:id', MailingPriorityController.deleteMailingPriority);

module.exports = router;