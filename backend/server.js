const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const businessRoutes = require('./routes/businessRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const documentRoutes = require('./routes/documentRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/business', businessRoutes);

// Nested routes for partners, transactions, reports, and documents
app.use('/api/business/:id/partners', partnerRoutes);
app.use('/api/business/:id/transactions', transactionRoutes);
app.use('/api/business/:id/reports', reportRoutes);
app.use('/api/business/:id/documents', documentRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Profit Summary API is running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

