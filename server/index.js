const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB().then(async () => {
  try {
    const { seedDonorsInternal } = require('./scripts/seedDonorsInternal');
    await seedDonorsInternal();
  } catch (err) {
    console.error('Auto-seed check warning:', err.message);
  }
});

const app = express();

// Explicit CORS Middleware guaranteeing Access-Control-Allow-Origin on all responses and preflights
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/search', require('./routes/search'));
app.use('/api/requests', require('./routes/request'));
app.use('/api/donors', require('./routes/donor'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.json({ message: 'BloodSync API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler to guarantee CORS headers on uncaught errors
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});