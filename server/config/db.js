const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI environment variable is not set');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = { connectDB };
