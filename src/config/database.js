const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create indexes
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection;
    
    // Create indexes for better query performance
    await db.collection('projects').createIndex({ slug: 1 });
    await db.collection('projects').createIndex({ category: 1 });
    await db.collection('projects').createIndex({ featured: 1 });
    
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    await db.collection('newsletters').createIndex({ email: 1 }, { unique: true });
    
    await db.collection('contacts').createIndex({ createdAt: -1 });
    await db.collection('ideas').createIndex({ createdAt: -1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

module.exports = connectDB;