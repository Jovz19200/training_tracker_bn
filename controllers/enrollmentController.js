const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private/Admin
exports.getEnrollments = async (req, res) => {
  try {
    let query;

    // If user is not admin, only show their enrollments
    if (req.user.role !== 'admin') {
      query = Enrollment.find({ user: req.user.id });
    } else {
      query = Enrollment.find();
    }

    // Populate course and user details
    query = query.populate({
      path: 'course',
      select: 'title startDate endDate instructor'
    }).populate({
      path: 'user',
      select: 'firstName lastName email'
    });

    const enrollments = await query;

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private
exports.getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate({
        path: 'course',
        select: 'title startDate endDate instructor'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Make sure user is enrollment owner or admin
    if (enrollment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this enrollment'
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create enrollment
// @route   POST /api/courses/:courseId/enroll
// @access  Private
exports.createEnrollment = async (req, res) => {
  try {
    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is full
    const currentEnrollments = await Enrollment.countDocuments({ course: req.params.courseId });
    if (currentEnrollments >= course.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: req.params.courseId,
      status: 'enrolled'
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update enrollment status
// @route   PUT /api/enrollments/:id
// @access  Private/Admin
exports.updateEnrollment = async (req, res) => {
  try {
    let enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Only allow status updates
    const allowedFields = ['status', 'completionDate', 'preTestScore', 'postTestScore', 'notes'];
    const updateFields = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // If status is being updated to 'completed', set completionDate
    if (updateFields.status === 'completed' && !updateFields.completionDate) {
      updateFields.completionDate = Date.now();
    }

    enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private/Admin
exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    await enrollment.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}; 