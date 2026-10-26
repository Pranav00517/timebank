const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const creditRoutes = require('./routes/creditRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS (SRS 3.4)
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check / API status endpoint (SRS NFR-1.3)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'TimeBank Learn REST API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`,
  });
});

// Central error handler (NFR-3.6)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // If the database is empty (e.g. freshly started memory-server), auto-seed demo data
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('No users found in database. Auto-populating initial TimeBank demo data...');
    const seedDatabase = require('./seeds/seedData');
    await seedDatabase();
  }

  const server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` TimeBank Learn REST API Server Running `);
    console.log(` Port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
