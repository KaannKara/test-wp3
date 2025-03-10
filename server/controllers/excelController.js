const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const ExcelFile = require('../models/ExcelFile');
const logger = require('../utils/logger');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `excel-${uniqueSuffix}${ext}`);
  }
});

// Configure multer upload
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Check file extension
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    // Check MIME type (but be more flexible)
    const validMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream',
      'application/excel',
      'application/x-excel',
      'application/x-msexcel'
    ];
    
    const validMimetype = validMimeTypes.includes(file.mimetype) || filetypes.test(file.mimetype);
    
    if (extname && validMimetype) {
      return cb(null, true);
    } else {
      logger.error(`Invalid file upload attempt: ${file.originalname} (${file.mimetype})`);
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('file');

// @desc    Upload Excel file
// @route   POST /api/excel/upload
// @access  Private
exports.uploadExcelFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      logger.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an Excel file' });
      }
      
      // Require authenticated user
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = req.user.id;
      
      logger.info(`Processing Excel file for user: ${userId}`);
      
      // Read Excel file
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Get headers directly from first row (with special handling)
      const range = xlsx.utils.decode_range(worksheet['!ref']);
      const headers = [];
      
      // Process column headers from A to Z (can extend if needed)
      const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      
      // Extract headers from the first row
      for (let colIdx = range.s.c; colIdx <= range.e.c; colIdx++) {
        const cellAddress = columns[colIdx] + '1'; // First row
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          headers.push(cell.v.toString());
        } else {
          // If header is missing, use column letter as header
          headers.push(columns[colIdx]);
        }
      }
      
      // Get data (starting from second row)
      const rawData = xlsx.utils.sheet_to_json(worksheet, { header: headers, range: 1 }); // Start from row 2 (index 1)
      
      // Filter out rows that are completely empty
      const data = rawData.filter(row => {
        return Object.values(row).some(val => val !== undefined && val !== null && val !== '');
      });
      
      if (data.length === 0) {
        return res.status(400).json({ message: 'Excel file is empty or does not contain valid data' });
      }
      
      logger.info(`Processed Excel file with ${headers.length} columns and ${data.length} rows`);
      
      // Save file info to database
      const excelFile = new ExcelFile({
        user: userId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        headers,
        data,
        rowCount: data.length
      });
      
      await excelFile.save();
      
      res.json({
        _id: excelFile._id,
        originalName: excelFile.originalName,
        headers: excelFile.headers,
        rowCount: data.length,
        uploadDate: excelFile.createdAt
      });
    } catch (error) {
      logger.error('Excel processing error:', error);
      // Delete the file if processing failed
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteErr) {
          logger.error('Error deleting failed Excel file:', deleteErr);
        }
      }
      res.status(500).json({ message: 'Error processing Excel file: ' + error.message });
    }
  });
};

// @desc    Get all Excel files for user
// @route   GET /api/excel
// @access  Private
exports.getExcelFiles = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    logger.info(`Getting Excel files for user: ${userId}`);
    
    const files = await ExcelFile.find({ user: userId })
      .select('_id originalName headers createdAt rowCount')
      .sort({ createdAt: -1 });
    
    res.json(files);
  } catch (error) {
    logger.error('Get Excel files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Excel file by ID
// @route   GET /api/excel/:id
// @access  Private
exports.getExcelFileById = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    logger.info(`Getting Excel file ${req.params.id} for user: ${userId}`);
    
    const file = await ExcelFile.findOne({ 
      _id: req.params.id,
      user: userId
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.json(file);
  } catch (error) {
    logger.error('Get Excel file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete Excel file
// @route   DELETE /api/excel/:id
// @access  Private
exports.deleteExcelFile = async (req, res) => {
  try {
    // Require authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.id;
    
    logger.info(`Deleting Excel file ${req.params.id} for user: ${userId}`);
    
    // Find the file to get the file path
    const file = await ExcelFile.findOne({ 
      _id: req.params.id,
      user: userId
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Delete the file from the filesystem
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        logger.info(`Deleted file from filesystem: ${file.path}`);
      } catch (err) {
        logger.error(`Error deleting file from filesystem: ${file.path}`, err);
        // Continue with database deletion even if file deletion fails
      }
    } else {
      logger.warn(`File not found in filesystem: ${file.path}`);
    }
    
    // Delete the file entry from the database
    await ExcelFile.findByIdAndDelete(req.params.id);
    logger.info(`Deleted file entry from database: ${req.params.id}`);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Delete Excel file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 