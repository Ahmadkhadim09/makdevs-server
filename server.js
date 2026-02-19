const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const mongoose = require('mongoose');

dotenv.config();

// Import DB - FIXED THE TYPO
const connectDB = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const testimonialRoutes = require('./src/routes/testimonialRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const ideaRoutes = require('./src/routes/ideaRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const newsletterRoutes = require('./src/routes/newsletterRoutes');

// Import error handler
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

/* ========================
   BODY PARSER
======================== */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ========================
   CORS CONFIG - IMPROVED
======================== */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://makdevs-client.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('🚫 Blocked origin:', origin); // Log blocked origins for debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

/* ========================
   SECURITY MIDDLEWARE
======================== */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());

/* ========================
   RATE LIMIT
======================== */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

/* ========================
   SANITIZATION
======================== */
app.use(mongoSanitize());
app.use(xss());

/* ========================
   ROUTES
======================== */
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/newsletter', newsletterRoutes);

/* ========================
   HEALTH CHECK - IMPROVED
======================== */
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'success',
    message: 'MAKDEVS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus[dbState] || 'unknown',
      readyState: dbState
    },
    uptime: process.uptime()
  });
});

/* ========================
   TEST ROUTE (for debugging)
======================== */
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

/* ========================
   404 HANDLER
======================== */
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

/* ========================
   ERROR HANDLER
======================== */
app.use(errorHandler);

/* ========================
   START SERVER
======================== */
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    const PORT = process.env.PORT || 10000;

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n');
      console.log('✅'.repeat(20));
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api/health`);
      console.log('✅'.repeat(20));
      console.log('\n');
    });

    // Graceful shutdown
    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION:', err);
      server.close(() => {
        console.log('💤 Process terminated due to unhandled rejection');
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully');
      server.close(() => {
        console.log('💤 Process terminated');
        mongoose.connection.close();
      });
    });

    process.on('SIGINT', () => {
      console.log('👋 SIGINT received. Shutting down gracefully');
      server.close(() => {
        console.log('💤 Process terminated');
        mongoose.connection.close();
      });
    });

  }).catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;