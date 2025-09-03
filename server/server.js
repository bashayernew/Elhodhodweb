const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const productRoutes = require('./routes/products');
const auctionRoutes = require('./routes/auctions');
const messageRoutes = require('./routes/messages');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const quotesRoutes = require('./routes/quotes');
const orderRoutes = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');
const postRequestRoutes = require('./routes/post-requests');
const favoriteRoutes = require('./routes/favorites');
const categoryRoutes = require('./routes/categories');
const providerRoutes = require('./routes/providers');
const publicUserRoutes = require('./routes/public-users');
const calendarRoutes = require('./routes/calendar');
const customersRoutes = require('./routes/customers');
const financeRoutes = require('./routes/finance');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Import database connection
const { connectDB } = require('./config/database');
const { seedOnStart } = require('./seed/devSeeder');

// Import Socket.IO handlers
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();
if (process.env.NODE_ENV !== 'production') {
  seedOnStart();
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://unpkg.com"],
      connectSrc: ["'self'", "https://nominatim.openstreetmap.org"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 50
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HodHod API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/post-requests', postRequestRoutes);
app.use('/api/favorites', authenticateToken, favoriteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/users/public', publicUserRoutes);
app.use('/api/wallet', authenticateToken, walletRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/quotes', authenticateToken, quotesRoutes);
app.use('/api/calendar', authenticateToken, calendarRoutes);
app.use('/api/customers', authenticateToken, customersRoutes);
app.use('/api/finance', authenticateToken, financeRoutes);

// Serve uploaded files (dev only)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO connection handling
socketHandler(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 HodHod API server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`💾 Database: SQLite with Prisma`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
