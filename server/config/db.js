const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    
    // Fallback to local MongoDB if placeholder is detected or MONGO_URI is missing
    if (!mongoURI || mongoURI === 'your_mongodb_connection_string' || (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://'))) {
      console.warn('⚠️  MONGO_URI in server/.env is invalid or using placeholder. Falling back to local MongoDB: mongodb://127.0.0.1:27017/bloodsync');
      mongoURI = 'mongodb://127.0.0.1:27017/bloodsync';
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.error(`💡 Tip: Please update MONGO_URI in server/.env with a valid connection string (e.g., mongodb://127.0.0.1:27017/bloodsync or MongoDB Atlas mongodb+srv://...)`);
    process.exit(1);
  }
};

module.exports = connectDB;