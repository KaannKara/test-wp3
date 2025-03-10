const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  runTask
} = require('../controllers/schedulerController');
const { protect } = require('../middleware/authMiddleware');

// Tüm rotelere koruma uygula
router.use(protect);

// Get all tasks for user
router.get('/', getTasks);

// Get task by ID
router.get('/:id', getTaskById);

// Create new task
router.post('/', createTask);

// Update task
router.put('/:id', updateTask);

// Delete task
router.delete('/:id', deleteTask);

// Run task immediately
router.post('/:id/run', runTask);

module.exports = router; 