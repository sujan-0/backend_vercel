const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  


let isConnected = false;
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI),{
    useNewUrlParser: true,
    useUnifiedTopology: true
    };
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

//add middleware to check connection before handling requests
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectToDatabase();
  }
  next();
});


// Routes
app.use('/api/todos', require('./routes/todos'));


//Do not use app.listen 
//const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


module.exports = app;