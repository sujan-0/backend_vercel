const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  dueDate: { type: Date },
  imageUrl: { type: String },  // Cloudinary URL
  pdfUrl: { type: String },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);