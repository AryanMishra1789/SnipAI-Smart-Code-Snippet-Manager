const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middlewares - Enhanced CORS settings for production deployments
const allowedOrigins = [
  'http://localhost:3002', 
  'http://localhost:3000',
  'https://snipai.netlify.app',  // Update with your actual Netlify URL
  'https://snipai.vercel.app'    // Update with your actual Vercel URL
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/snippets', require('./routes/snippets'));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

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

// Port configuration - Railway will provide a PORT environment variable
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Process ID: ${process.pid}`);
});
