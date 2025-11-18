const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Connect to MongoDB (Atlas or Local)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-certificates';

console.log('🔌 Connecting to MongoDB...');
console.log(`📍 Connection URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  if (error.name === 'MongoServerSelectionError') {
    console.error('   → Check your internet connection and MongoDB Atlas IP whitelist');
    console.error('   → Make sure your IP is whitelisted in MongoDB Atlas Network Access');
  }
  console.log('⚠️  Server will continue but database operations may fail');
});

// Initialize Fabric client
const FabricClient = require('./fabric-client/fabricClientIntegrated');
const fabricClient = new FabricClient();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Fabric client on startup
(async () => {
    try {
        await fabricClient.init();
        console.log('✅ Fabric client initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Fabric client:', error);
        // Don't exit, allow server to start for health checks
    }
})();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// Disable HTTP request logging (morgan) - uncomment to enable
// app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const certificateRoutes = require('./routes/certificateRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const certificateController = require('./controllers/certificateController');

// Set the fabric client in the controller
certificateController.setFabricClient(fabricClient);

// API Routes
app.use('/api/certificates', certificateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    const stats = fabricClient.getStorageStats ? fabricClient.getStorageStats() : {};
    res.json({
        status: 'OK',
        message: 'Academic Certificates Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        fabricConnected: fabricClient.isConnected,
        storage: stats
    });
});

// Development endpoints
if (process.env.NODE_ENV === 'development') {
    app.get('/api/dev/storage', (req, res) => {
        const stats = fabricClient.getStorageStats();
        res.json(stats);
    });
    
    app.post('/api/dev/clear-storage', (req, res) => {
        const stats = fabricClient.clearStorage();
        res.json({ message: 'Storage cleared and reinitialized', stats });
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            path: req.originalUrl
        }
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Gracefully shutting down...');
    try {
        await fabricClient.disconnect();
        console.log('✅ Fabric client disconnected');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Academic Certificates Backend running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
