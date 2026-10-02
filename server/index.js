const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://blood-sync-nine.vercel.app',
    'https://bloodsync.vercel.app',
    'https://bloodsync-arnab-kashyap.vercel.app',
  ],
  credentials: true,
}));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});