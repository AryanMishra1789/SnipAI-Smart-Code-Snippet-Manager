const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // For a hackathon demo, we'll create a mock database connection
    // In a real implementation, you would use MongoDB Atlas or a local MongoDB server
    console.log('Setting up database connection...');
    
    // Mock the MongoDB connection for demo purposes
    global.mockDB = {
      snippets: []
    };
    
    console.log('Mock database connected successfully');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
