const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/snippets', require('./routes/snippets'));

// Import path for file operations
const path = require('path');

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode, serving static files');
  
  // Set static folder - use path.resolve for consistent path resolution across platforms
  const clientBuildPath = path.resolve(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));
  
  console.log(`Static files being served from: ${clientBuildPath}`);
  
  // Any route that is not api will be redirected to index.html
  app.get('*', (req, res) => {
    const indexPath = path.resolve(__dirname, '..', 'client', 'build', 'index.html');
    console.log(`Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });
} else {
  // Basic route for dev environment
  app.get('/', (req, res) => {
    res.send('SnipAI API is running...');
  });
}

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
