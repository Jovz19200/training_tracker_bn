import multer from 'multer';
import cloudinary from './../config/cloudinary.js';

export const upload = multer({ dest: 'uploads/' });

export const uploadMultipleImages = async (files) => {
  try {
    const uploadedImages = [];

    for (const file of files) {
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
    }
    return uploadedImages;
  } catch (error) {
    throw new Error('Failed to upload images to Cloudinary: ' + error.message);
  }
};

export const uploadImage = async (file) => {
  try {
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
  } catch (error) {
    throw new Error('Failed to upload image to Cloudinary: ' + error.message);
  }
}; 