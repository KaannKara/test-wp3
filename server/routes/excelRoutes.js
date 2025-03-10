const express = require('express');
const router = express.Router();
const { 
  uploadExcelFile, 
  getExcelFiles, 
  getExcelFileById,
  deleteExcelFile
} = require('../controllers/excelController');
const { protect } = require('../middleware/authMiddleware');

// Apply protection middleware to all routes
router.use(protect);

// Excel file routes
router.post('/upload', uploadExcelFile);
router.get('/', getExcelFiles);
router.get('/:id', getExcelFileById);
router.delete('/:id', deleteExcelFile);

module.exports = router; 