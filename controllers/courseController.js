const Course = require('../models/Course');
const { uploadImage, deleteImage } = require('../utils/uploadImage');
const path = require('path');
const fs = require('fs');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'firstName lastName').populate('resources');
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'firstName lastName').populate('resources');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private
const createCourse = async (req, res) => {
  try {
    // Add user to req.body
    req.body.instructor = req.user.id;

    // Handle thumbnail upload
    if (req.file) {
      try {
        const thumbnail = await uploadImage(req.file);
        if (thumbnail) {
          req.body.thumbnail = thumbnail;
        }
      } catch (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        // Continue without thumbnail if upload fails
      }
    }

    // Parse the training data if it's a string
    const courseData = typeof req.body.training === 'string' 
      ? JSON.parse(req.body.training)
      : req.body.training || req.body;

    // Add instructor and thumbnail if they exist in the root
    if (req.body.instructor) courseData.instructor = req.body.instructor;
    if (req.body.thumbnail) courseData.thumbnail = req.body.thumbnail;

    const course = await Course.create(courseData);
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Handle thumbnail upload
    if (req.file) {
      try {
        // Delete old thumbnail if exists
        if (course.thumbnail && course.thumbnail.public_id) {
          await deleteImage(course.thumbnail.public_id);
        }
        
        const thumbnail = await uploadImage(req.file);
        if (thumbnail) {
          req.body.thumbnail = thumbnail;
        }
      } catch (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        // Continue without updating thumbnail if upload fails
      }
    }

    // Create update object with only the fields that are provided
    const updateFields = {};
    const allowedFields = [
      'title', 'description', 'duration', 'capacity', 
      'startDate', 'endDate', 'location', 'isVirtual', 
      'virtualMeetingLink', 'materials', 'prerequisites', 
      'status', 'accessibilityFeatures', 'tags', 'thumbnail'
    ];

    // Only include fields that are provided in the request
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Update only if there are fields to update
    if (Object.keys(updateFields).length > 0) {
      course = await Course.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        {
          new: true,
          runValidators: true
        }
      );
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    console.error('Course update error:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Delete thumbnail if exists
    if (course.thumbnail && course.thumbnail.public_id) {
      await deleteImage(course.thumbnail.public_id);
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get courses by organization
// @route   GET /api/courses/organization/:organizationId
// @access  Public
const getCoursesByOrganization = async (req, res) => {
  try {
    const courses = await Course.find({ organization: req.params.organizationId })
      .populate('instructor', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Upload a material to a course
const uploadCourseMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const fileType = path.extname(req.file.originalname).substring(1).toLowerCase();
    const material = {
      title: req.body.title || req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType,
      uploadDate: new Date()
    };
    course.materials.push(material);
    await course.save();
    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a material from a course
const deleteCourseMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const materialId = req.params.materialId;
    const material = course.materials.id(materialId) || course.materials.find(m => m._id?.toString() === materialId);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    // Remove from array
    course.materials = course.materials.filter(m => m._id?.toString() !== materialId);
    await course.save();
    res.status(200).json({ success: true, message: 'Material deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// List all materials for a course
const listCourseMaterials = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, data: course.materials });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Download a material file
const downloadCourseMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const materialId = req.params.materialId;
    const material = course.materials.id(materialId) || course.materials.find(m => m._id?.toString() === materialId);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    const filePath = path.join(__dirname, '..', material.fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found on server' });
    res.download(filePath, material.title || path.basename(filePath));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByOrganization,
  uploadCourseMaterial,
  deleteCourseMaterial,
  listCourseMaterials,
  downloadCourseMaterial
};