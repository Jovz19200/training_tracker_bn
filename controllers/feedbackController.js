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
    let canProvideFeedback = false;
    let feedbackReason = '';

    // Check enrollment status
    enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (enrollment) {
      // User has an enrollment record - allow feedback for most statuses
      switch (enrollment.status) {
        case 'completed':
        case 'enrolled':
        case 'failed':
          canProvideFeedback = true;
          feedbackReason = `Enrolled with status: ${enrollment.status}`;
          break;
        
        case 'dropped':
          // Allow feedback if they attended some sessions before dropping
          const Attendance = require('../models/Attendance');
          const attendanceCount = await Attendance.countDocuments({
            enrollment: enrollment._id,
            status: 'present'
          });
          
          if (attendanceCount > 0) {
            canProvideFeedback = true;
            feedbackReason = 'Attended sessions before dropping';
          } else {
            canProvideFeedback = false;
            feedbackReason = 'No sessions attended before dropping';
          }
          break;
        
        default:
          canProvideFeedback = false;
          feedbackReason = 'Invalid enrollment status';
      }
    } else {
      // No enrollment record - check if user is admin or has special permissions
      if (req.user.role === 'admin' || req.user.role === 'trainer') {
        canProvideFeedback = true;
        feedbackReason = 'Admin/Trainer feedback';
      } else {
        canProvideFeedback = false;
        feedbackReason = 'No enrollment record found';
      }
    }

    if (!canProvideFeedback) {
      return res.status(403).json({
        success: false,
        message: `Cannot provide feedback: ${feedbackReason}`,
        details: {
          enrollmentStatus: enrollment?.status || 'none',
          courseEndDate: course.endDate,
          currentDate: new Date(),
          reason: feedbackReason
        }
      });
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

    // Auto-complete enrollment if course has ended and user is still enrolled
    if (enrollment && enrollment.status === 'enrolled') {
      const currentDate = new Date();
      const courseEndDate = new Date(course.endDate);
      
      if (currentDate > courseEndDate) {
        // Check if user has attended any sessions
        const Attendance = require('../models/Attendance');
        const attendanceCount = await Attendance.countDocuments({
          enrollment: enrollment._id,
          status: 'present'
        });
        
        if (attendanceCount > 0) {
          // Auto-complete the enrollment
          enrollment.status = 'completed';
          enrollment.completionDate = new Date();
          await enrollment.save();
        }
      }
    }

    // Add user and course to req.body
    req.body.user = req.user.id;
    req.body.course = req.params.courseId;
    if (enrollment) {
      req.body.enrollment = enrollment._id;
    }

    const feedback = await Feedback.create(req.body);

    const user = await require('../models/User').findById(req.user.id).select('disabilityType accessibilityNeeds');
    res.status(201).json({
      success: true,
      data: feedback,
      metadata: {
        enrollmentStatus: enrollment?.status || 'none',
        feedbackReason,
        userDisabilityType: user?.disabilityType || null,
        userAccessibilityNeeds: user?.accessibilityNeeds || null,
        autoCompleted: enrollment?.status === 'completed' && enrollment?.completionDate === new Date()
      }
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

// @desc    Get feedback by user
// @route   GET /api/feedback/user/:userId
// @access  Private
exports.getFeedbackByUser = async (req, res) => {
  try {
    // Check if user exists
    const User = require('../models/User');
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only allow access to own feedback, admin, or course instructor
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s feedback'
      });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Feedback.countDocuments({ user: req.params.userId });

    const feedback = await Feedback.find({ user: req.params.userId })
      .populate({
        path: 'course',
        select: 'title startDate endDate'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName',
        transform: doc => doc.isAnonymous ? { firstName: 'Anonymous', lastName: 'User' } : doc
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ submissionDate: -1 });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: feedback.length,
      pagination,
      data: feedback
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get feedback for a specific course
// @route   GET /api/feedback/course/:courseId
// @access  Private
exports.getFeedbackByCourse = async (req, res) => {
  try {
    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Only allow access to course instructor, admin, or enrolled users
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      // Check if user is enrolled in the course
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: req.params.courseId
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view feedback for this course'
        });
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Feedback.countDocuments({ course: req.params.courseId });

    const feedback = await Feedback.find({ course: req.params.courseId })
      .populate({
        path: 'user',
        select: 'firstName lastName',
        transform: doc => doc.isAnonymous ? { firstName: 'Anonymous', lastName: 'User' } : doc
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ submissionDate: -1 });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: feedback.length,
      pagination,
      data: feedback
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all feedback (admin only)
// @route   GET /api/feedback
// @access  Private (Admin)
exports.getAllFeedback = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Feedback.countDocuments();

    const feedback = await Feedback.find()
      .populate({
        path: 'user',
        select: 'firstName lastName',
        transform: doc => doc.isAnonymous ? { firstName: 'Anonymous', lastName: 'User' } : doc
      })
      .populate('course', 'title')
      .populate('enrollment')
      .skip(startIndex)
      .limit(limit)
      .sort({ submissionDate: -1 });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: feedback.length,
      pagination,
      data: feedback
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}; 