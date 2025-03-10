const express = require('express');
const router = express.Router();
const { 
  scheduleMessage, 
  getScheduledMessages, 
  cancelScheduledMessage 
} = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Scheduled message routes
router.post('/', scheduleMessage);
router.get('/', getScheduledMessages);
router.delete('/:id', cancelScheduledMessage);

module.exports = router; 