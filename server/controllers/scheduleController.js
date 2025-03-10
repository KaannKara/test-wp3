const mongoose = require('mongoose');
const ScheduledMessage = require('../models/ScheduledMessage');
const ExcelFile = require('../models/ExcelFile');
const whatsappService = require('../services/whatsappService');
const cron = require('node-cron');

// Track all scheduled jobs
const scheduledJobs = {};

// Parse date from Excel formats (handles both DD.MM.YYYY and YYYY-MM-DD)
const parseExcelDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Check for DD.MM.YYYY format
  const ddmmyyyy = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  if (ddmmyyyy.test(dateStr)) {
    const [_, day, month, year] = dateStr.match(ddmmyyyy);
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }
  
  // Try native Date parsing for YYYY-MM-DD or other formats
  return new Date(dateStr);
};

// Helper to check if today matches the target date
const isSameDate = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// @desc    Schedule message
// @route   POST /api/schedule
// @access  Private
exports.scheduleMessage = async (req, res) => {
  try {
    const { groupId, fileId, dateField, messageTemplate } = req.body;
    
    if (!groupId || !fileId || !dateField || !messageTemplate) {
      return res.status(400).json({ 
        message: 'Group ID, file ID, date field, and message template are required' 
      });
    }
    
    // Get the Excel file
    const excelFile = await ExcelFile.findOne({ 
      _id: fileId,
      user: req.user.id
    });
    
    if (!excelFile) {
      return res.status(404).json({ message: 'Excel file not found' });
    }
    
    // Get the group information
    const groups = await whatsappService.getGroups(req.user.id);
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Create scheduled message
    const scheduledMessage = new ScheduledMessage({
      user: req.user.id,
      excelFile: excelFile._id,
      groupId,
      groupName: group.name,
      dateField,
      messageTemplate,
      status: 'pending',
      targetDate: new Date() // Will be updated in the daily check
    });
    
    await scheduledMessage.save();
    
    // Set up scheduled job for today if needed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Schedule it for immediate execution if there are records for today
    setupScheduledMessageJob(scheduledMessage._id);
    
    res.json(scheduledMessage);
  } catch (error) {
    console.error('Schedule message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get scheduled messages
// @route   GET /api/schedule
// @access  Private
exports.getScheduledMessages = async (req, res) => {
  try {
    const messages = await ScheduledMessage.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Get scheduled messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel scheduled message
// @route   DELETE /api/schedule/:id
// @access  Private
exports.cancelScheduledMessage = async (req, res) => {
  try {
    const message = await ScheduledMessage.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!message) {
      return res.status(404).json({ message: 'Scheduled message not found' });
    }
    
    // Only allow canceling pending messages
    if (message.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot cancel message with status: ${message.status}` 
      });
    }
    
    // Cancel the job if it exists
    cancelScheduledJob(message._id);
    
    // Update status
    message.status = 'cancelled';
    await message.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Cancel scheduled message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set up scheduled job for a message
const setupScheduledMessageJob = async (messageId) => {
  try {
    const message = await ScheduledMessage.findById(messageId);
    if (!message || message.status !== 'pending') return;
    
    // Cancel existing job if any
    cancelScheduledJob(messageId);
    
    // Get Excel file
    const excelFile = await ExcelFile.findById(message.excelFile);
    if (!excelFile) return;
    
    // Set up cron job to check for matching records
    const jobId = messageId.toString();
    
    // Schedule job to run every day at 8:00 AM
    scheduledJobs[jobId] = cron.schedule('0 8 * * *', async () => {
      await processScheduledMessage(messageId);
    });
    
    // Also process immediately to check for today's records
    processScheduledMessage(messageId);
  } catch (error) {
    console.error(`Error setting up job for message ${messageId}:`, error);
  }
};

// Cancel a scheduled job
const cancelScheduledJob = (messageId) => {
  const jobId = messageId.toString();
  
  if (scheduledJobs[jobId]) {
    scheduledJobs[jobId].stop();
    delete scheduledJobs[jobId];
  }
};

// Process a scheduled message
const processScheduledMessage = async (messageId) => {
  try {
    const message = await ScheduledMessage.findById(messageId);
    if (!message || message.status !== 'pending') return;
    
    const excelFile = await ExcelFile.findById(message.excelFile);
    if (!excelFile) return;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter records with the target date matching today
    const recordsForToday = excelFile.data.filter(record => {
      const dateValue = record[message.dateField];
      if (!dateValue) return false;
      
      const recordDate = parseExcelDate(dateValue);
      return recordDate && isSameDate(recordDate, today);
    });
    
    if (recordsForToday.length > 0) {
      // Update target date
      message.targetDate = today;
      
      // Generate message from template and records
      let messageText = `🚨 BUGÜN BİTEN POLİÇELER (${today.toLocaleDateString('tr-TR')}):\n\n`;
      
      // Process each record
      for (const record of recordsForToday) {
        // Replace placeholders in template with actual data
        let recordMessage = message.messageTemplate;
        
        // Simple replacement for each field
        for (const [field, value] of Object.entries(record)) {
          const placeholder = new RegExp(`{${field}}`, 'g');
          recordMessage = recordMessage.replace(placeholder, value || '');
        }
        
        messageText += `${recordMessage}\n➖➖➖➖➖➖➖➖➖\n\n`;
      }
      
      // Send message to group
      await whatsappService.sendGroupMessage(
        message.user,
        message.groupId,
        messageText
      );
      
      // Update status
      message.status = 'sent';
      message.sentAt = new Date();
    }
    
    await message.save();
  } catch (error) {
    console.error(`Error processing scheduled message ${messageId}:`, error);
    
    // Update status to failed
    try {
      await ScheduledMessage.findByIdAndUpdate(messageId, { 
        status: 'failed' 
      });
    } catch (updateError) {
      console.error(`Error updating message status: ${updateError}`);
    }
  }
};

// Initialize all scheduled jobs on server start
exports.initializeScheduledJobs = async () => {
  try {
    const pendingMessages = await ScheduledMessage.find({ status: 'pending' });
    
    for (const message of pendingMessages) {
      setupScheduledMessageJob(message._id);
    }
    
    console.log(`Initialized ${pendingMessages.length} scheduled message jobs`);
  } catch (error) {
    console.error('Error initializing scheduled jobs:', error);
  }
}; 