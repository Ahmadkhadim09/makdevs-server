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

// Import DB
const connectDB = require('./src/config/db');

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
   CORS CONFIG
======================== */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://makdevs-client.vercel.app',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (!allowedOrigins.includes(origin)) {
      return callback(new Error('CORS not allowed'), false);
    }

    return callback(null, true);
  },
  credentials: true
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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
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
   HEALTH CHECK
======================== */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MAKDEVS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
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
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION:', err);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully');
      server.close(() => {
        console.log('💤 Process terminated');
      });
    });
  });
}

module.exports = app;
