const mongoose = require('mongoose');

const ExcelFileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  headers: {
    type: [String],
    default: []
  },
  data: {
    type: Array,
    default: []
  },
  rowCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExcelFile', ExcelFileSchema); 