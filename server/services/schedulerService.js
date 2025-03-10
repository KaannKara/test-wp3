const cron = require('node-cron');
const moment = require('moment');
const ScheduledTask = require('../models/ScheduledTask');
const ExcelFile = require('../models/ExcelFile');
const whatsappService = require('./whatsappService');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const User = require('../models/User');

// Upload dizini tanımla
const uploadsDir = path.join(__dirname, '../uploads');

// Store active tasks in memory
const activeTasks = new Map();

/**
 * Initialize scheduler service and load all active tasks
 */
async function initialize() {
  try {
    logger.info('Initializing scheduler service...');
    
    // Clear any existing scheduled tasks
    activeTasks.clear();
    
    // Find all active tasks
    const tasks = await ScheduledTask.find({ status: 'active' });
    logger.info(`Found ${tasks.length} active scheduled tasks`);
    
    // Schedule each task
    for (const task of tasks) {
      scheduleTask(task);
    }
    
    // Also schedule expiry date checker to run every day at 00:01
    scheduleExpiryDateChecker();
    
    logger.info('Scheduler service initialized successfully');
    return tasks.length;
  } catch (error) {
    logger.error('Failed to initialize scheduler service:', error);
    throw error;
  }
}

/**
 * Schedule a daily task to check for expiry dates
 */
function scheduleExpiryDateChecker() {
  // Run at 00:01 every day
  const job = cron.schedule('1 0 * * *', async () => {
    try {
      logger.info('Running daily expiry date checker');
      const today = moment().startOf('day');
      
      // Find all active expiry-date tasks
      const tasks = await ScheduledTask.find({
        status: 'active',
        scheduleType: 'expiry-date'
      });
      
      logger.info(`Found ${tasks.length} expiry-date tasks to check`);
      
      // Process each task
      for (const task of tasks) {
        try {
          await processExpiryDateTask(task);
        } catch (taskError) {
          logger.error(`Error processing expiry date task ${task._id}:`, taskError);
        }
      }
    } catch (error) {
      logger.error('Error in expiry date checker:', error);
    }
  });
  
  // Store the job
  activeTasks.set('expiry-date-checker', job);
}

/**
 * Process an expiry date task
 */
async function processExpiryDateTask(task) {
  try {
    // Get the latest task data (it might have been updated)
    const latestTask = await ScheduledTask.findById(task._id);
    if (!latestTask || latestTask.status !== 'active') {
      logger.info(`Task ${task._id} is no longer active or does not exist.`);
      return;
    }
    
    // Get the Excel file data
    const excelFile = await ExcelFile.findById(task.excelFile);
    if (!excelFile) {
      logger.error(`Excel file not found for task ${task._id}`);
      await ScheduledTask.findByIdAndUpdate(task._id, { 
        status: 'failed', 
        $set: { updatedAt: new Date() } 
      });
      return;
    }

    const filePath = path.join(uploadsDir, excelFile.filename);
    if (!fs.existsSync(filePath)) {
      logger.error(`Excel file ${filePath} does not exist on disk for task ${task._id}`);
      await ScheduledTask.findByIdAndUpdate(task._id, { 
        status: 'failed', 
        $set: { updatedAt: new Date() } 
      });
      return;
    }

    // Load the Excel data
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      logger.info(`No data found in Excel file for task ${task._id}`);
      return;
    }

    // Get today's date for comparison
    const today = moment().startOf('day');
    
    // Filter rows with matching expiry date
    const rowsToProcess = data.filter(row => {
      if (!row[task.expiryDateColumn]) return false;
      
      // Parse the date from the row using the specified format
      const expiryDate = moment(row[task.expiryDateColumn], task.expiryDateFormat || 'DD.MM.YYYY');
      return expiryDate.isValid() && expiryDate.startOf('day').isSame(today);
    });

    if (rowsToProcess.length === 0) {
      logger.info(`No entries with matching expiry date (${today.format('DD.MM.YYYY')}) found for task ${task._id}`);
      return;
    }

    // Update last run time
    await ScheduledTask.findByIdAndUpdate(task._id, { 
      lastRun: new Date(),
      $set: { updatedAt: new Date() }
    });

    // Process rows based on groupByDate setting
    if (task.groupByDate) {
      // Send as one combined message
      await sendGroupedMessage(task, rowsToProcess, today);
    } else {
      // Send individual messages for each row
      for (const rowData of rowsToProcess) {
        await sendMessageFromTemplate(task, rowData);
      }
    }

    logger.info(`Successfully processed expiry date task ${task._id} for date ${today.format('DD.MM.YYYY')}`);
  } catch (error) {
    logger.error(`Error processing expiry date task ${task._id}: ${error.message}`);
    console.error(error);
  }
}

/**
 * Converts Excel date values to moment dates
 * @param {any} value - The value to check and convert
 * @param {string} format - Output format
 * @returns {string|any} - Returns the formatted date or original value
 */
function parseExcelDate(value, format = 'DD.MM.YYYY') {
  // Check if it's a number (Excel serial date)
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value) && !isNaN(parseFloat(value)))) {
    // Convert Excel serial date to JavaScript date
    // Excel dates start from Jan 1, 1900 and each day is 1 unit
    const numVal = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it looks like an Excel date (reasonable date range between 1950-2100)
    // Excel values: 1950 = ~18000, 2100 = ~73000
    if (numVal >= 15000 && numVal <= 80000) {
      // Excel date bug: Excel treats 1900 as a leap year, so we need to adjust
      const date = new Date((numVal - 25569) * 86400 * 1000);
      return moment(date).format(format);
    }
  }

  // Check if it's a string date format
  if (typeof value === 'string') {
    // Try to parse with various formats
    const possibleFormats = ['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'];
    for (const fmt of possibleFormats) {
      const parsed = moment(value, fmt, true);
      if (parsed.isValid()) {
        return parsed.format(format);
      }
    }
  }

  // Return original value if not a recognized date
  return value;
}

/**
 * Schedule a task based on its schedule type
 */
function scheduleTask(task) {
  if (activeTasks.has(task._id.toString())) {
    const job = activeTasks.get(task._id.toString());
    job.stop();
    activeTasks.delete(task._id.toString());
  }

  let cronExpression;
  switch (task.scheduleType) {
    case 'once':
      // For one-time task, schedule it for the specified date/time
      const scheduledTime = new Date(task.scheduledDateTime);
      if (scheduledTime <= new Date()) {
        logger.warn(`Task ${task._id} has a past scheduled date, running it immediately`);
        runTask(task).catch(err => {
          logger.error(`Error running task ${task._id} immediately: ${err.message}`);
        });
        return;
      }
      cronExpression = `${scheduledTime.getSeconds()} ${scheduledTime.getMinutes()} ${scheduledTime.getHours()} ${scheduledTime.getDate()} ${scheduledTime.getMonth() + 1} *`;
      break;
    
    case 'minutely':
      // For minutely tasks, run every X minutes
      const minutes = task.minutes || 30;
      cronExpression = `*/${minutes} * * * *`;
      break;
    
    case 'hourly':
      // For hourly tasks, run every X hours
      const hours = task.hours || 1;
      cronExpression = `0 */${hours} * * *`;
      break;
    
    case 'daily':
      // For daily tasks, run at the specified time each day
      const [hour, minute] = (task.timeOfDay || '09:00').split(':');
      cronExpression = `0 ${minute} ${hour} * * *`;
      break;
    
    case 'expiry-date':
      // For expiry-date tasks, run daily at a specific time to check for matching dates
      // Use timeOfDay if provided, default to 9:00 AM
      const [expHour, expMinute] = (task.timeOfDay || '09:00').split(':');
      cronExpression = `0 ${expMinute} ${expHour} * * *`;
      break;
    
    default:
      logger.error(`Unknown schedule type: ${task.scheduleType} for task ${task._id}`);
      return;
  }

  logger.info(`Scheduling task ${task._id} with expression: ${cronExpression}`);
  const job = cron.schedule(cronExpression, () => {
    runTask(task).catch(err => {
      logger.error(`Error running scheduled task ${task._id}: ${err.message}`);
    });
  });

  activeTasks.set(task._id.toString(), job);
}

/**
 * Run a scheduled task
 */
async function runTask(task) {
  try {
    logger.info(`Running scheduled task: ${task._id} (${task.name})`);
    
    // Check if task is still active
    const latestTask = await ScheduledTask.findById(task._id);
    if (!latestTask || latestTask.status !== 'active') {
      logger.info(`Task ${task._id} is no longer active or does not exist.`);
      return;
    }
    
    // Use the latest task data
    task = latestTask;

    // Get the Excel file data
    const excelFile = await ExcelFile.findById(task.excelFile);
    if (!excelFile) {
      logger.error(`Excel file not found for task ${task._id}`);
      await ScheduledTask.findByIdAndUpdate(task._id, { 
        status: 'failed', 
        $set: { updatedAt: new Date() } 
      });
      return;
    }

    const filePath = path.join(uploadsDir, excelFile.filename);
    if (!fs.existsSync(filePath)) {
      logger.error(`Excel file ${filePath} does not exist on disk for task ${task._id}`);
      await ScheduledTask.findByIdAndUpdate(task._id, { 
        status: 'failed', 
        $set: { updatedAt: new Date() } 
      });
      return;
    }

    // Load the Excel data
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      logger.info(`No data found in Excel file for task ${task._id}`);
      return;
    }

    // For one-time tasks, mark as completed after execution
    if (task.scheduleType === 'once') {
      await ScheduledTask.findByIdAndUpdate(task._id, { 
        status: 'completed',
        $set: { updatedAt: new Date() }
      });
    } else {
      // Update last run time for recurring tasks
      await ScheduledTask.findByIdAndUpdate(task._id, { 
        lastRun: new Date(),
        $set: { updatedAt: new Date() }
      });
    }

    // Determine data to process based on expiryDateColumn setting
    let rowsToProcess = data;
    
    // If expiryDateColumn is set, filter data by expiry date (for any schedule type)
    if (task.expiryDateColumn) {
      // Get today's date for comparison
      const today = moment().startOf('day');
      const todayFormatted = today.format('DD.MM.YYYY');
      
      logger.info(`Checking for entries with expiry date matching today (${todayFormatted})`);
      
      // Filter rows with matching expiry date
      rowsToProcess = data.filter(row => {
        if (!row[task.expiryDateColumn]) return false;
        
        // Get the value and parse it as date (handling Excel serial dates)
        const rawValue = row[task.expiryDateColumn];
        const formattedDate = parseExcelDate(rawValue, 'DD.MM.YYYY');
        
        // Check if the parsed date is today
        const expiryDate = moment(formattedDate, 'DD.MM.YYYY');
        const match = expiryDate.isValid() && expiryDate.startOf('day').isSame(today);
        
        if (match) {
          logger.info(`Found matching record with expiry date: ${rawValue} → ${formattedDate}`);
        }
        
        return match;
      });

      if (rowsToProcess.length === 0) {
        logger.info(`No entries with matching expiry date (${todayFormatted}) found for task ${task._id}`);
        return;
      }
      
      logger.info(`Found ${rowsToProcess.length} entries with matching expiry date for task ${task._id}`);
    }

    // Pre-process rows to format all dates before sending
    rowsToProcess = rowsToProcess.map(row => {
      const processedRow = { ...row };
      
      // Convert potential date fields in all columns
      for (const column of Object.keys(row)) {
        if (row[column] !== undefined && row[column] !== null) {
          // Check if column name suggests it contains a date
          if (/tari|date|birth|bitim|doğum/i.test(column)) {
            processedRow[column] = parseExcelDate(row[column], 'DD.MM.YYYY');
          }
        }
      }
      
      return processedRow;
    });

    // Process rows based on groupByDate setting for expiry date filtered data
    if (task.expiryDateColumn && task.groupByDate) {
      // Send as one combined message
      await sendGroupedMessage(task, rowsToProcess, moment().startOf('day'));
    } else {
      // Send individual messages for each row
      for (const rowData of rowsToProcess) {
        await sendMessageFromTemplate(task, rowData);
      }
    }

    logger.info(`Successfully processed task ${task._id}`);
  } catch (error) {
    logger.error(`Error processing task ${task._id}: ${error.message}`);
    console.error(error);
  }
}

/**
 * Send a grouped message with all data entries in one message
 */
async function sendGroupedMessage(task, rowsToProcess, today) {
  try {
    const { selectedGroups, selectedColumns, messageTemplate } = task;

    if (!selectedGroups || selectedGroups.length === 0) {
      logger.warn(`No groups selected for task ${task._id}, skipping message send`);
      return;
    }

    // Format the date for display in the message
    const formattedDate = today.format('DD.MM.YYYY');
    
    // Create message header
    let message = messageTemplate.replace('{{TODAY_DATE}}', formattedDate);
    
    // Add details for combined message
    const detailsPlaceholder = '{{DETAILS}}';
    let combinedDetails = '';
    
    // Process each row and add to combined details
    for (const rowData of rowsToProcess) {
      let entryDetails = '';
      
      // Add each selected column to the entry details with emojis
      for (const column of selectedColumns) {
        if (rowData[column] !== undefined) {
          let value = rowData[column];
          
          // Date formatting is now handled in the pre-processing step
          
          // Format currency values with commas for thousand separators
          if (typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))) {
            if (/prim/i.test(column)) {
              value = Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
          }
          
          // Add emoji based on column name
          let emoji = '📌';
          if (/pol[iı]çe.*tür/i.test(column)) emoji = '📝';
          else if (/müşteri/i.test(column)) emoji = '📋';
          else if (/şirket/i.test(column)) emoji = '🏢';
          else if (/doğum/i.test(column)) emoji = '📅';
          else if (/prim/i.test(column)) emoji = '💰';
          else if (/tc/i.test(column)) emoji = '🆔';
          else if (/plaka/i.test(column)) emoji = '🚗';
          else if (/pol[iı]çe.*no/i.test(column)) emoji = '📄';
          else if (/telefon/i.test(column)) emoji = '☎️';
          else if (/bit[iı]ş/i.test(column)) emoji = '📅';
          
          entryDetails += `${emoji} ${column}: ${value}\n`;
        }
      }
      
      // Add separator between entries
      combinedDetails += entryDetails + "➖➖➖➖➖➖➖➖➖\n\n";
    }
    
    // Replace details placeholder
    message = message.replace(detailsPlaceholder, combinedDetails);
    
    // Add summary at the end of the message
    const totalPolicies = rowsToProcess.length;
    message += `\n⚠️ Toplam ${totalPolicies} adet poliçe bugün bitiyor. Lütfen ilgili müşterilerle iletişime geçiniz.`;
    
    // Replace any remaining placeholders
    const placeholderRegex = /{{([^}]+)}}/g;
    message = message.replace(placeholderRegex, (match, column) => {
      // Check if it's a special placeholder we've already handled
      if (column === 'TODAY_DATE' || column === 'DETAILS') {
        return '';
      }
      return '';
    });

    // Get the user ID from task
    const userId = task.user.toString();
    if (!userId) {
      logger.error(`No user ID found for task ${task._id}, cannot send message`);
      return;
    }

    // Send the message to all selected groups
    for (const groupId of selectedGroups) {
      try {
        // Grup mesajları için sendGroupMessage kullanıyoruz
        await whatsappService.sendGroupMessage(userId, groupId, message);
        logger.info(`Successfully sent grouped message to group ${groupId} for task ${task._id}`);
      } catch (error) {
        logger.error(`Failed to send grouped message to group ${groupId} for task ${task._id}: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error sending grouped message for task ${task._id}: ${error.message}`);
    console.error(error);
  }
}

/**
 * Send a message using a template and row data
 */
async function sendMessageFromTemplate(task, rowData) {
  try {
    const { selectedGroups, selectedColumns, messageTemplate } = task;

    if (!selectedGroups || selectedGroups.length === 0) {
      logger.warn(`No groups selected for task ${task._id}, skipping message send`);
      return;
    }

    // Replace {{TODAY_DATE}} with formatted current date
    const today = moment().format('DD.MM.YYYY');
    let message = messageTemplate.replace('{{TODAY_DATE}}', today);
    
    // Generate details section from selected columns
    const detailsPlaceholder = '{{DETAILS}}';
    let details = '';
    
    for (const column of selectedColumns) {
      if (rowData[column] !== undefined) {
        let value = rowData[column];
        
        // Date formatting is now handled in the pre-processing step
        
        // Format currency values with commas for thousand separators
        if (typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))) {
          if (/prim/i.test(column)) {
            value = Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
        }
        
        // Add emoji based on column name
        let emoji = '📌';
        if (/pol[iı]çe.*tür/i.test(column)) emoji = '📝';
        else if (/müşteri/i.test(column)) emoji = '📋';
        else if (/şirket/i.test(column)) emoji = '🏢';
        else if (/doğum/i.test(column)) emoji = '📅';
        else if (/prim/i.test(column)) emoji = '💰';
        else if (/tc/i.test(column)) emoji = '🆔';
        else if (/plaka/i.test(column)) emoji = '🚗';
        else if (/pol[iı]çe.*no/i.test(column)) emoji = '📄';
        else if (/telefon/i.test(column)) emoji = '☎️';
        else if (/bit[iı]ş/i.test(column)) emoji = '📅';
        
        details += `${emoji} ${column}: ${value}\n`;
      }
    }
    
    // Replace details placeholder
    if (message.includes(detailsPlaceholder)) {
      message = message.replace(detailsPlaceholder, details);
    }
    
    // Replace individual column placeholders (e.g., {{Column}})
    const placeholderRegex = /{{([^}]+)}}/g;
    message = message.replace(placeholderRegex, (match, column) => {
      // Check if it's a special placeholder we've already handled
      if (column === 'TODAY_DATE' || column === 'DETAILS') {
        return '';
      }
      
      // Try to replace with the column value from rowData
      if (rowData[column] !== undefined) {
        let value = rowData[column];
        
        // Format currency values
        if (typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))) {
          if (/prim/i.test(column)) {
            value = Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
        }
        
        return value;
      }
      
      return match; // Keep the placeholder if no replacement found
    });

    // Get the user ID from task
    const userId = task.user.toString();
    if (!userId) {
      logger.error(`No user ID found for task ${task._id}, cannot send message`);
      return;
    }

    // Send the message to all selected groups
    for (const groupId of selectedGroups) {
      try {
        // Grup mesajları için sendGroupMessage kullanıyoruz
        await whatsappService.sendGroupMessage(userId, groupId, message);
        logger.info(`Successfully sent message to group ${groupId} for task ${task._id}`);
      } catch (error) {
        logger.error(`Failed to send message to group ${groupId} for task ${task._id}: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error sending message from template for task ${task._id}: ${error.message}`);
    console.error(error);
  }
}

/**
 * Create a new scheduled task
 */
async function createTask(taskData) {
  try {
    // Validate required fields
    if (!taskData.name || !taskData.excelFileId || !taskData.scheduleType || !taskData.user) {
      throw new Error('Missing required fields: name, excelFileId, scheduleType, user');
    }

    // Create the task
    const task = new ScheduledTask({
      user: taskData.user,
      excelFile: taskData.excelFileId,
      name: taskData.name,
      scheduleType: taskData.scheduleType,
      minutes: taskData.minutes || 30,
      hours: taskData.hours || 1,
      timeOfDay: taskData.timeOfDay || '09:00',
      scheduledDateTime: taskData.scheduledDateTime,
      expiryDateColumn: taskData.expiryDateColumn,
      expiryDateFormat: taskData.expiryDateFormat || 'DD.MM.YYYY',
      groupByDate: taskData.groupByDate !== undefined ? taskData.groupByDate : true,
      selectedGroups: taskData.selectedGroups || [],
      selectedColumns: taskData.selectedColumns || [],
      messageTemplate: taskData.messageTemplate || '🚨 BUGÜN BİTEN POLİÇELER ({{TODAY_DATE}}):\n\n{{DETAILS}}\n➖➖➖➖➖➖➖➖➖',
    });

    // Save to database
    const savedTask = await task.save();
    logger.info(`Created scheduled task: ${savedTask._id}`);

    // Start the task
    scheduleTask(savedTask);

    return savedTask;
  } catch (error) {
    logger.error(`Error creating scheduled task: ${error.message}`);
    throw error;
  }
}

/**
 * Update an existing task
 */
async function updateTask(taskId, taskData) {
  try {
    const task = await ScheduledTask.findByIdAndUpdate(taskId, taskData, { new: true });
    
    // If task is active, reschedule it
    if (task && task.status === 'active') {
      scheduleTask(task);
    } else if (task && task.status !== 'active') {
      // If task is no longer active, remove it from scheduled tasks
      if (activeTasks.has(taskId.toString())) {
        activeTasks.get(taskId.toString()).stop();
        activeTasks.delete(taskId.toString());
      }
    }
    
    return task;
  } catch (error) {
    logger.error(`Failed to update scheduled task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Delete a task
 */
async function deleteTask(taskId) {
  try {
    // Stop and remove from active tasks
    if (activeTasks.has(taskId.toString())) {
      activeTasks.get(taskId.toString()).stop();
      activeTasks.delete(taskId.toString());
    }
    
    // Delete from database
    await ScheduledTask.findByIdAndDelete(taskId);
    
    return true;
  } catch (error) {
    logger.error(`Failed to delete scheduled task ${taskId}:`, error);
    throw error;
  }
}

module.exports = {
  initialize,
  createTask,
  updateTask,
  deleteTask,
  scheduleTask
}; 