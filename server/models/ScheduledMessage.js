const mongoose = require('mongoose');

const ScheduledMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  excelFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExcelFile',
    required: true
  },
  groupId: {
    type: String,
    required: true
  },
  groupName: {
    type: String,
    required: true
  },
  dateField: {
    type: String,
    required: true
  },
  targetDate: {
    type: Date,
    required: true
  },
  messageTemplate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  sentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScheduledMessage', ScheduledMessageSchema); 