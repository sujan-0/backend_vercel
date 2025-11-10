// middleware/upload.js
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB total
  fileFilter: (req, file, cb) => {
    const allowed = {
      image: ['image/jpeg', 'image/jpg', 'image/png'],
      pdf: ['application/pdf'],
    };
    if (allowed[file.fieldname]?.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}`));
    }
  },
});

module.exports = {
  multi: upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
};