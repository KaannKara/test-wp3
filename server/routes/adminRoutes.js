const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUser,
  deleteWhatsAppSession,
  getOrphanedSessions,
  deleteOrphanedSession
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// User management routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);

// WhatsApp session management
router.delete('/users/:id/whatsapp-session', deleteWhatsAppSession);

// Orphaned sessions management
router.get('/orphaned-sessions', getOrphanedSessions);
router.delete('/orphaned-sessions/:id', deleteOrphanedSession);

module.exports = router; 