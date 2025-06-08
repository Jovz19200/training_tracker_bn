const Feedback = require('../models/Feedback');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Get all feedback for a course
// @route   GET /api/courses/:courseId/feedback
// @access  Public
exports.getCourseFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ course: req.params.courseId })
      .populate({
        path: 'user',
        select: 'firstName lastName',
        // If feedback is anonymous, don't show user details
        transform: doc => doc.isAnonymous ? { firstName: 'Anonymous', lastName: 'User' } : doc
      });

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'firstName lastName',
        transform: doc => doc.isAnonymous ? { firstName: 'Anonymous', lastName: 'User' } : doc
      });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Only allow access to the feedback creator, course instructor, or admin
    if (feedback.user._id.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        feedback.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this feedback'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create feedback
// @route   POST /api/courses/:courseId/feedback
// @access  Private
exports.createFeedback = async (req, res) => {
  try {
    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let enrollment = null;

    // If user is not admin, check enrollment
    if (req.user.role !== 'admin') {
      enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: req.params.courseId,
        status: { $in: ['enrolled', 'completed'] }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to provide feedback'
        });
      }
    }

    // Check if user has already submitted feedback for this course
    const existingFeedback = await Feedback.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this course'
      });
    }

    // Add user and course to req.body
    req.body.user = req.user.id;
    req.body.course = req.params.courseId;
    if (enrollment) {
      req.body.enrollment = enrollment._id;
    }

    const feedback = await Feedback.create(req.body);

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
exports.updateFeedback = async (req, res) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Make sure user is feedback owner
    if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback'
      });
    }

    // Create update object with only the fields that are provided
    const updateFields = {};
    const allowedFields = [
      'overallRating', 'contentRating', 'instructorRating',
      'facilitiesRating', 'accessibilityRating', 'commentContent',
      'commentInstructor', 'commentGeneral', 'suggestions',
      'isAnonymous'
    ];

    // Only include fields that are provided in the request
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Update only if there are fields to update
    if (Object.keys(updateFields).length > 0) {
      feedback = await Feedback.findByIdAndUpdate(
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
      data: feedback
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Make sure user is feedback owner or admin
    if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback'
      });
    }

    await feedback.deleteOne();

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