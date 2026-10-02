const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../server/config/db');

dotenv.config();

const app = express();

// Reuse MongoDB connection across serverless function invocations
let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      const { seedDonorsInternal } = require('../server/scripts/seedDonorsInternal');
      await seedDonorsInternal();
    } catch (err) {
      console.error('DB connection/seed warning:', err.message);
    }
    isConnected = true;
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/search', require('../server/routes/search'));
app.use('/api/requests', require('../server/routes/request'));
app.use('/api/donors', require('../server/routes/donor'));
app.use('/api/chat', require('../server/routes/chat'));

app.get('/api', (req, res) => {
  res.json({ message: 'BloodSync API is running on Vercel Serverless' });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
