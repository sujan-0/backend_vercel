const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;  // For deleting temp files

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'todos',  // Your app's folder
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
      ...options,
    });
    // Delete temp local file after upload
    await fs.unlink(localFilePath);
    return result.secure_url;  // Return just the URL
  } catch (error) {
    // Clean up on error too
    try { await fs.unlink(localFilePath); } catch {} 
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from URL (e.g., https://res.cloudinary.com/demo/image/upload/v123/todos/myfile.jpg → todos/myfile)
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete failed:', error.message);
    // Don't throw—deletes are best-effort
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };