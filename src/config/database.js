const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });

    console.log('✅ MongoDB Atlas Connected Successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌍 Host: ${conn.connection.host}`);
    console.log(`🔌 Port: ${conn.connection.port}`);

    await createIndexes();

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    
    // More specific error messages
    if (error.name === 'MongoNetworkError') {
      console.error('🔍 Network error - check your IP whitelist in MongoDB Atlas');
      console.error('📝 Go to: Network Access → Add IP Address → Add your Render IPs or 0.0.0.0/0');
    }
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('🔍 Server selection error - check your connection string');
      console.error('📝 Make sure username and password are correct in MONGODB_URI');
    }
    
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection;

    console.log('🔄 Creating database indexes...');

    // Projects indexes
    await db.collection('projects').createIndex({ slug: 1 }, { unique: true, sparse: true });
    await db.collection('projects').createIndex({ category: 1 });
    await db.collection('projects').createIndex({ featured: 1 });
    await db.collection('projects').createIndex({ createdAt: -1 });

    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    // Newsletters indexes
    await db.collection('newsletters').createIndex({ email: 1 }, { unique: true });
    await db.collection('newsletters').createIndex({ status: 1 });

    // Contacts indexes
    await db.collection('contacts').createIndex({ createdAt: -1 });
    await db.collection('contacts').createIndex({ status: 1 });

    // Ideas indexes
    await db.collection('ideas').createIndex({ createdAt: -1 });
    await db.collection('ideas').createIndex({ status: 1 });
    await db.collection('ideas').createIndex({ priority: 1 });

    // Services indexes
    await db.collection('services').createIndex({ order: 1 });

    // Team indexes
    await db.collection('teams').createIndex({ order: 1 });
    await db.collection('teams').createIndex({ featured: 1 });

    // Testimonials indexes
    await db.collection('testimonials').createIndex({ featured: 1 });
    await db.collection('testimonials').createIndex({ rating: -1 });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    // Don't exit process - indexes are not critical for app to run
  }
};

module.exports = connectDB;