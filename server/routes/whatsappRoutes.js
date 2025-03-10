const express = require('express');
const router = express.Router();
const { 
  initWhatsApp, 
  getQrCode, 
  getStatus, 
  sendMessage, 
  getGroups, 
  sendGroupMessage,
  getSilentMode,
  setSilentMode
} = require('../controllers/whatsappController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// WhatsApp connection routes
router.get('/qr', getQrCode);
router.get('/status', getStatus);
router.post('/init', initWhatsApp);

// Messaging routes
router.post('/send', sendMessage);
router.post('/send-group', sendGroupMessage);

// Group routes
router.get('/groups', getGroups);

// Silent mode routes - to prevent auto refresh on message receipt
router.get('/silent-mode', getSilentMode);
router.post('/silent-mode', setSilentMode);

module.exports = router; 