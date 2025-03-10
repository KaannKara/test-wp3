const whatsappService = require('../services/whatsappService');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure multer storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

// Configure multer upload
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('image');

// @desc    Initialize WhatsApp connection
// @route   POST /api/whatsapp/init
// @access  Private
exports.initWhatsApp = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    logger.info(`Initializing WhatsApp for user: ${userId}`);
    
    await whatsappService.createConnection(userId);
    
    res.json({ 
      message: 'WhatsApp connection initialized. Scan the QR code to connect.' 
    });
  } catch (error) {
    logger.error('Init WhatsApp error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get QR code for WhatsApp connection
// @route   GET /api/whatsapp/qr
// @access  Private
exports.getQrCode = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    logger.info(`Getting QR code for user: ${userId}`);
    console.log(`Getting QR code for user: ${userId}`);
    
    // Initialize WhatsApp if not already initialized
    try {
      const connection = whatsappService.getConnection(userId);
      if (!connection) {
        console.log(`No existing connection for user: ${userId}, initializing...`);
        await whatsappService.createConnection(userId);
      }
    } catch (initError) {
      console.log(`Error initializing connection: ${initError.message}`);
      // Continue trying to get QR anyway
    }
    
    const qr = whatsappService.getQRCode(userId);
    console.log(`QR code available for user ${userId}: ${qr ? 'YES' : 'NO'}`);
    
    if (!qr) {
      console.log(`QR code not found for user: ${userId}. Returning 404.`);
      return res.status(404).json({ 
        message: 'QR code not available. Please initialize WhatsApp connection first.' 
      });
    }
    
    console.log(`Returning QR code for user: ${userId}`);
    res.json({ qr });
  } catch (error) {
    logger.error('Get QR code error:', error);
    console.error('Get QR code error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get connection status
// @route   GET /api/whatsapp/status
// @access  Private
exports.getStatus = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    logger.info(`Getting connection status for user: ${userId}`);
    
    const connection = whatsappService.getConnection(userId);
    
    if (!connection) {
      return res.json({ connected: false });
    }
    
    res.json({ connected: connection.connected || false });
  } catch (error) {
    logger.error('Get status error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Send message to a number
// @route   POST /api/whatsapp/send
// @access  Private
exports.sendMessage = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      logger.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    try {
      // Require authenticated user
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = req.user.id;
      
      const { number, message } = req.body;
      
      if (!number || !message) {
        return res.status(400).json({ message: 'Number and message are required' });
      }
      
      logger.info(`Sending message to ${number} for user: ${userId}`);
      
      // Send message with or without image
      const result = await whatsappService.sendMessage(
        userId, 
        number, 
        message, 
        req.file ? req.file.path : null
      );
      
      res.json({ success: true, result });
    } catch (error) {
      logger.error('Send message error:', error);
      res.status(500).json({ message: error.message || 'Server error' });
    }
  });
};

// @desc    Get all WhatsApp groups
// @route   GET /api/whatsapp/groups
// @access  Private
exports.getGroups = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    logger.info(`Getting groups for user: ${userId}`);
    
    // Get groups with error handling
    try {
      const groups = await whatsappService.getGroups(userId);
      
      // Update user's groups in database
      try {
        await User.findByIdAndUpdate(userId, { groups });
      } catch (dbError) {
        logger.error(`Failed to update user's groups in database: ${dbError.message}`);
        // Continue even if database update fails
      }
      
      res.json(groups);
    } catch (whatsappError) {
      logger.error(`WhatsApp groups fetch error: ${whatsappError.message}`);
      res.status(500).json({ 
        message: whatsappError.message || 'Failed to fetch WhatsApp groups',
        reconnect: whatsappError.message.includes('connection')
      });
    }
  } catch (error) {
    logger.error('Get groups error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Send message to a group
// @route   POST /api/whatsapp/send-group
// @access  Private
exports.sendGroupMessage = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      logger.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    try {
      // Require authenticated user
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = req.user.id;
      
      const { groupId, message } = req.body;
      
      if (!groupId || !message) {
        return res.status(400).json({ message: 'Group ID and message are required' });
      }
      
      logger.info(`Sending message to group ${groupId} for user: ${userId}`);
      
      // Send message with or without image
      const result = await whatsappService.sendGroupMessage(
        userId, 
        groupId, 
        message, 
        req.file ? req.file.path : null
      );
      
      res.json({ success: true, result });
    } catch (error) {
      logger.error('Send group message error:', error);
      res.status(500).json({ message: error.message || 'Server error' });
    }
  });
};

// @desc    Get WhatsApp Silent Message Mode Status
// @route   GET /api/whatsapp/silent-mode
// @access  Private
exports.getSilentMode = async (req, res) => {
  try {
    const isSilent = whatsappService.isSilentMessageMode();
    res.json({ silentMode: isSilent });
  } catch (error) {
    logger.error('Get silent mode error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Set WhatsApp Silent Message Mode
// @route   POST /api/whatsapp/silent-mode
// @access  Private
exports.setSilentMode = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Invalid request. "enabled" must be a boolean value.' });
    }
    
    whatsappService.setSilentMessageMode(enabled);
    logger.info(`Silent message mode ${enabled ? 'enabled' : 'disabled'} by user: ${req.user.id}`);
    
    res.json({ success: true, silentMode: enabled });
  } catch (error) {
    logger.error('Set silent mode error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
}; 