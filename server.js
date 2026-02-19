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
   🔥 FIX 3: CORS MIDDLEWARE - PUT IT HERE 🔥
======================== */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Your frontend URLs
  const allowedOrigins = [
    'https://frontend-m-7megbybna-muhammad-ahmads-projects-d5bda9cb.vercel.app',
    'https://frontend-m-ak.vercel.app',
    'http://localhost:3000'
  ];
  
  // Allow requests from allowed origins
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Set other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight request');
    return res.sendStatus(200);
  }
  
  next();
});

/* ========================
   EXISTING CORS (you can keep or remove)
   If you keep it, make sure it doesn't conflict
======================== */
// You can COMMENT OUT your existing cors() or leave it
// app.use(cors()); // ← If this is here, comment it out

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
  message: { status: 'error', message: 'Too many requests' }
});
app.use('/api', limiter);

/* ========================
   SANITIZATION
======================== */
app.use(mongoSanitize());
app.use(xss());

/* ========================
   ROUTES - THESE COME AFTER CORS MIDDLEWARE
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
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.status(200).json({
      status: 'success',
      message: 'MAKDEVS API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus[dbState] || 'unknown',
        readyState: dbState
      },
      cors: 'enabled',
      allowedOrigins: [
        'https://frontend-m-7megbybna-muhammad-ahmads-projects-d5bda9cb.vercel.app',
        'https://frontend-m-ak.vercel.app'
      ]
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/* ========================
   TEST ENDPOINT (for debugging)
======================== */
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working!',
    headers: req.headers,
    time: new Date().toISOString()
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
      console.log('\n✅'.repeat(20));
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api/health`);
      console.log('✅'.repeat(20) + '\n');
    });

    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION:', err);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received');
      server.close(() => {
        mongoose.connection.close();
        process.exit(0);
      });
    });
  }).catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;