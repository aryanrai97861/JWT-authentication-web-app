const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Request logging

// Routes
app.use('/api', userRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Target Account Matching API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Connect to database
  await connectDB();

});

module.exports = app;