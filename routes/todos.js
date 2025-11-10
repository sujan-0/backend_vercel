const express = require('express');
const Todo = require('../models/Todo');
const { multi: upload } = require('../middleware/upload');  // Use multi for fields
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const router = express.Router();

// GET all TODOs
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new TODO (with optional image + PDF)
router.post('/', upload, async (req, res) => {
  try {
    const { text, dueDate, completed } = req.body;
    let imageUrl = '';
    let pdfUrl = '';
    if (req.files && req.files['image']) {
      imageUrl = await uploadToCloudinary(req.files['image'][0].path, { 
        allowed_formats: ['jpg', 'png', 'jpeg'],
        resource_type: 'image' 
      });
    }
    if (req.files && req.files['pdf']) {
      pdfUrl = await uploadToCloudinary(req.files['pdf'][0].path, { 
        allowed_formats: ['pdf'],
        resource_type: 'raw' 
      });
    }
    const todo = new Todo({ text, dueDate, imageUrl, pdfUrl, completed: completed === 'true' });
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update TODO
router.put('/:id', upload, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    todo.text = req.body.text || todo.text;
    todo.dueDate = req.body.dueDate || todo.dueDate;
    todo.completed = req.body.completed !== undefined ? req.body.completed === 'true' : todo.completed;

    // Handle image update
    if (req.files && req.files['image']) {
      if (todo.imageUrl) await deleteFromCloudinary(todo.imageUrl);
      todo.imageUrl = await uploadToCloudinary(req.files['image'][0].path, { 
        allowed_formats: ['jpg', 'png', 'jpeg'],
        resource_type: 'image' 
      });
    }

    // Handle PDF update
    if (req.files && req.files['pdf']) {
      if (todo.pdfUrl) await deleteFromCloudinary(todo.pdfUrl);
      todo.pdfUrl = await uploadToCloudinary(req.files['pdf'][0].path, { 
        allowed_formats: ['pdf'],
        resource_type: 'raw' 
      });
    }

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE TODO
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (todo.imageUrl) await deleteFromCloudinary(todo.imageUrl);
    if (todo.pdfUrl) await deleteFromCloudinary(todo.pdfUrl);

    await todo.remove();
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;