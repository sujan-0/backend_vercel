const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image' && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else if (file.fieldname === 'pdf' && file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error(`${file.fieldname} must be a valid ${file.fieldname === 'image' ? 'image' : 'PDF'}!`), false);
  }
};

const upload = multer({
  storage,
  limits: { 
    fileSize: (req, file, cb) => {
      const maxSize = file.fieldname === 'pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;  // 10MB PDF, 5MB image
      cb(null, maxSize);
    }
  },
  fileFilter,
});

// Middleware to handle multiple fields: image and pdf
const multiUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]);

module.exports = { single: upload.single('image'), multi: multiUpload };  // Export both for flexibility