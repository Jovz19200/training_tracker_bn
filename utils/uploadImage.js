const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Try to require cloudinary, but don't fail if it's not configured
let cloudinary = null;
try {
  cloudinary = require('../config/cloudinary');
} catch (error) {
  console.log('Cloudinary not configured, using local file storage');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure uploads directory exists
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadMultipleImages = async (files) => {
  try {
    const uploadedImages = [];

    for (const file of files) {
      if (cloudinary) {
        // Use Cloudinary if available
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'course_thumbnails',
          use_filename: true,
          transformation: [
            { width: 500, height: 500, crop: 'limit' }
          ]
        });

        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url
        });
      } else {
        // Use local file path if Cloudinary is not available
        uploadedImages.push({
          public_id: file.filename,
          url: `/uploads/${file.filename}`
        });
      }
    }
    return uploadedImages;
  } catch (error) {
    throw new Error('Failed to upload images: ' + error.message);
  }
};

const uploadImage = async (file) => {
  try {
    if (cloudinary) {
      // Use Cloudinary if available
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'course_thumbnails',
        use_filename: true,
        transformation: [
          { width: 500, height: 500, crop: 'limit' }
        ]
      });
      
      return {
        public_id: result.public_id,
        url: result.secure_url
      };
    } else {
      // Use local file path if Cloudinary is not available
      return {
        public_id: file.filename,
        url: `/uploads/${file.filename}`
      };
    }
  } catch (error) {
    throw new Error('Failed to upload image: ' + error.message);
  }
};

const deleteImage = async (publicId) => {
  try {
    if (cloudinary && publicId) {
      await cloudinary.uploader.destroy(publicId);
    } else if (publicId) {
      // Delete local file
      const filePath = path.join('uploads', publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error, just log it
  }
};

module.exports = {
  upload,
  uploadMultipleImages,
  uploadImage,
  deleteImage
}; 