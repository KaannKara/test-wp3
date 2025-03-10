const mongoose = require('mongoose');

const ScheduledTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string
    required: true
  },
  excelFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExcelFile',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed'],
    default: 'active'
  },
  scheduleType: {
    type: String,
    enum: ['once', 'minutely', 'hourly', 'daily', 'expiry-date'],
    required: true
  },
  // For minutely schedule (every X minutes)
  minutes: {
    type: Number,
    min: 1,
    max: 60,
    default: 30
  },
  // For hourly schedule (every X hours)
  hours: {
    type: Number,
    min: 1,
    max: 24,
    default: 1
  },
  // For daily schedule (specific time of day)
  timeOfDay: {
    type: String, // HH:MM format
    default: '09:00'
  },
  // For one-time schedule (specific date and time)
  scheduledDateTime: {
    type: Date
  },
  // For expiry-date schedule (send when expiry date is today)
  expiryDateColumn: {
    type: String
  },
  expiryDateFormat: {
    type: String,
    default: 'DD.MM.YYYY'
  },
  // Group messages by date (send as one combined message)
  groupByDate: {
    type: Boolean,
    default: true
  },
  lastRun: {
    type: Date
  },
  nextRun: {
    type: Date
  },
  selectedGroups: {
    type: [String], // Array of group IDs
    default: []
  },
  selectedColumns: {
    type: [String], // Array of column names to include in message
    default: []
  },
  messageTemplate: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
ScheduledTaskSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('ScheduledTask', ScheduledTaskSchema); 