const User = require('../models/User');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

/**
 * Get all users (admin only)
 * @route   GET /api/admin/users
 * @access  Admin
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get active WhatsApp sessions
    const usersWithConnectionStatus = users.map(user => {
      const userData = user.toObject();
      const userId = user._id.toString();
      
      // Check if there's an active connection
      const connection = whatsappService.getConnection(userId);
      userData.connectionActive = connection ? connection.connected : false;
      
      return userData;
    });
    
    res.json(usersWithConnectionStatus);
  } catch (error) {
    logger.error('Admin - Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get single user by ID (admin only)
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get WhatsApp connection status
    const userData = user.toObject();
    const userId = user._id.toString();
    
    // Check if there's an active connection
    const connection = whatsappService.getConnection(userId);
    userData.connectionActive = connection ? connection.connected : false;
    
    res.json(userData);
  } catch (error) {
    logger.error(`Admin - Get user by ID error for ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user (admin only) - Can update role, etc.
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
exports.updateUser = async (req, res) => {
  try {
    const { role } = req.body;
    
    // Only allow updating certain fields
    const updates = {};
    
    if (role) {
      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      updates.role = role;
    }
    
    // Add any other allowed fields here
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error(`Admin - Update user error for ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Disconnect and delete a user's WhatsApp session (admin only)
 * @route   DELETE /api/admin/users/:id/whatsapp-session
 * @access  Admin
 */
exports.deleteWhatsAppSession = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Disconnect and delete session
    const success = await whatsappService.disconnectAndDeleteSession(userId);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to disconnect WhatsApp session' });
    }
    
    res.json({ message: 'WhatsApp session disconnected and deleted successfully' });
  } catch (error) {
    logger.error(`Admin - Delete WhatsApp session error for ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get orphaned WhatsApp sessions (sessions without a user)
 * @route   GET /api/admin/orphaned-sessions
 * @access  Admin
 */
exports.getOrphanedSessions = async (req, res) => {
  try {
    logger.info('Admin - Getting orphaned WhatsApp sessions');
    
    const orphanedSessions = await whatsappService.getOrphanedSessions();
    
    res.json(orphanedSessions);
  } catch (error) {
    logger.error('Admin - Get orphaned sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete an orphaned WhatsApp session
 * @route   DELETE /api/admin/orphaned-sessions/:id
 * @access  Admin
 */
exports.deleteOrphanedSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    logger.info(`Admin - Deleting orphaned WhatsApp session: ${sessionId}`);
    
    const success = await whatsappService.deleteOrphanedSession(sessionId);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete orphaned session' });
    }
    
    res.json({ message: 'Orphaned session deleted successfully' });
  } catch (error) {
    logger.error(`Admin - Delete orphaned session error for ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
}; 