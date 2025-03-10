const ScheduledTask = require('../models/ScheduledTask');
const ExcelFile = require('../models/ExcelFile');
const schedulerService = require('../services/schedulerService');
const logger = require('../utils/logger');

/**
 * Get all scheduled tasks for a user
 * @route GET /api/scheduler
 * @access Private
 */
exports.getTasks = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    logger.info(`Getting scheduled tasks for user: ${userId}`);
    
    const tasks = await ScheduledTask.find({ user: userId })
      .populate('excelFile', 'originalName headers rowCount')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    logger.error('Failed to get scheduled tasks:', error);
    res.status(500).json({ message: 'Failed to get scheduled tasks' });
  }
};

/**
 * Get a scheduled task by ID
 * @route GET /api/scheduler/:id
 * @access Private
 */
exports.getTaskById = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    const task = await ScheduledTask.findOne({
      _id: req.params.id,
      user: userId
    }).populate('excelFile', 'originalName headers data rowCount');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    logger.error(`Failed to get task ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to get task' });
  }
};

/**
 * Create a new scheduled task
 * @route POST /api/scheduler
 * @access Private
 */
exports.createTask = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    // Validate input
    const {
      name,
      excelFileId,
      scheduleType,
      messageTemplate,
      selectedGroups,
      selectedColumns
    } = req.body;
    
    if (!name || !excelFileId || !scheduleType || !messageTemplate) {
      return res.status(400).json({
        message: 'Please provide name, excelFileId, scheduleType, and messageTemplate'
      });
    }
    
    // Check if the Excel file exists
    const excelFile = await ExcelFile.findById(excelFileId);
    if (!excelFile) {
      return res.status(400).json({ message: 'Excel file not found' });
    }
    
    // Check for required fields based on schedule type
    if (scheduleType === 'minutely' && (!req.body.minutes || req.body.minutes < 1)) {
      return res.status(400).json({ message: 'Please provide valid minutes (>= 1)' });
    }
    
    if (scheduleType === 'hourly' && (!req.body.hours || req.body.hours < 1)) {
      return res.status(400).json({ message: 'Please provide valid hours (>= 1)' });
    }
    
    if (scheduleType === 'daily' && !req.body.timeOfDay) {
      return res.status(400).json({ message: 'Please provide timeOfDay (HH:MM)' });
    }
    
    if (scheduleType === 'once' && !req.body.scheduledDateTime) {
      return res.status(400).json({ message: 'Please provide scheduledDateTime' });
    }
    
    if (scheduleType === 'expiry-date' && !req.body.expiryDateColumn) {
      return res.status(400).json({ message: 'Please provide expiryDateColumn' });
    }
    
    // Create task data
    const taskData = {
      name,
      user: userId,
      excelFile: excelFileId,
      scheduleType,
      messageTemplate,
      selectedGroups: selectedGroups || [],
      selectedColumns: selectedColumns || [],
      status: 'active',
      ...req.body // Include other fields
    };
    
    // Create the task
    const task = await schedulerService.createTask(taskData);
    
    res.status(201).json(task);
  } catch (error) {
    logger.error('Failed to create task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

/**
 * Update a scheduled task
 * @route PUT /api/scheduler/:id
 * @access Private
 */
exports.updateTask = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    // Check if task exists and belongs to user
    const task = await ScheduledTask.findOne({
      _id: req.params.id,
      user: userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update the task
    const updatedTask = await schedulerService.updateTask(req.params.id, req.body);
    
    res.json(updatedTask);
  } catch (error) {
    logger.error(`Failed to update task ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

/**
 * Delete a scheduled task
 * @route DELETE /api/scheduler/:id
 * @access Private
 */
exports.deleteTask = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    // Check if task exists and belongs to user
    const task = await ScheduledTask.findOne({
      _id: req.params.id,
      user: userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Delete the task
    await schedulerService.deleteTask(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error(`Failed to delete task ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

/**
 * Manually run a scheduled task immediately
 * @route POST /api/scheduler/:id/run
 * @access Private
 */
exports.runTask = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    // Check if task exists and belongs to user
    const task = await ScheduledTask.findOne({
      _id: req.params.id,
      user: userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Run the task (in background)
    schedulerService.scheduleTask(task);
    
    res.json({ message: 'Task scheduled to run' });
  } catch (error) {
    logger.error(`Failed to run task ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to run task' });
  }
}; 