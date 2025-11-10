// api/serve.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Increase payload limit for file buffers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Reuse MongoDB connection across warm invocations
let conn = null;
async function connectDB() {
  if (conn) return conn;
  conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB connected');
  return conn;
}

// Ensure DB is connected before route handling
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Routes
app.use('/todos', require('../routes/todos'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

module.exports = app;