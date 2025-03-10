const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

// Import routes
const authRoutes = require('./routes/authRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const excelRoutes = require('./routes/excelRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const specialEventRoutes = require('./routes/specialEventRoutes');

// Import services
const { initializeScheduledJobs } = require('./controllers/scheduleController');
const schedulerService = require('./services/schedulerService');
const specialEventService = require('./services/specialEventService');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://kaankyt1:Adanademir1.@whatsapp-cluster-v2.du2ij.mongodb.net/?retryWrites=true&w=majority&appName=WhatsApp-Cluster-v2');
    console.log('MongoDB connected successfully');
    
    // Initialize services after connecting to MongoDB
    try {
      // Initialize old scheduled jobs
      await initializeScheduledJobs();
      
      // Initialize the new scheduler service
      const tasksCount = await schedulerService.initialize();
      logger.info(`Initialized ${tasksCount} scheduled message tasks`);

      // Initialize cron job for special events processing
      setupCronJobs();
    } catch (initError) {
      logger.error('Failed to initialize services:', initError);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Setup cron jobs
const setupCronJobs = () => {
  // Process special events every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running special events processing cron job');
    try {
      const results = await specialEventService.processSpecialEvents();
      logger.info(`Special events processed: ${results.success} success, ${results.failed} failed`);
    } catch (error) {
      logger.error('Error running special events cron job:', error);
    }
  });
  
  logger.info('Special events cron job scheduled');
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/special-events', specialEventRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
connectDB(); 