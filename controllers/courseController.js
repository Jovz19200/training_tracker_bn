const Course = require('../models/Course');
const { uploadImage } = require('../utils/uploadImage');
const cloudinary = require('../config/cloudinary');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'firstName lastName');
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
    const course = await Course.findById(req.params.id).populate('instructor', 'firstName lastName');
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
      const thumbnail = await uploadImage(req.file);
      if (thumbnail) {
        req.body.thumbnail = thumbnail;
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
      // Delete old thumbnail if exists
      if (course.thumbnail && course.thumbnail.public_id) {
        await cloudinary.uploader.destroy(course.thumbnail.public_id);
      }
      const thumbnail = await uploadImage(req.file);
      if (thumbnail) {
        req.body.thumbnail = thumbnail;
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
      await cloudinary.uploader.destroy(course.thumbnail.public_id);
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

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByOrganization
};