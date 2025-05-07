const TrainingRequest = require('../models/TrainingRequest');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Get all training requests
// @route   GET /api/requests
// @access  Admin only
exports.getTrainingRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const status = req.query.status;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    const requests = await TrainingRequest.find(query)
      .populate('user', 'firstName lastName email')
      .populate('course', 'title code')
      .populate('approver', 'firstName lastName')
      .skip(startIndex)
      .limit(limit)
      .sort('-requestDate');

    const total = await TrainingRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: requests
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single training request
// @route   GET /api/requests/:id
// @access  Private (Admin or request owner)
exports.getTrainingRequest = async (req, res) => {
  try {
    const request = await TrainingRequest.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('course', 'title code')
      .populate('approver', 'firstName lastName');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Training request not found'
      });
    }

    // Check if user is admin or request owner
    if (req.user.role !== 'admin' && request.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this request'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new training request
// @route   POST /api/requests
// @access  Private (Trainee/Trainer)
exports.createTrainingRequest = async (req, res) => {
  try {
    const { course, justification, accessibilityRequirements } = req.body;

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user already has a pending or approved request for this course
    const existingRequest = await TrainingRequest.findOne({
      user: req.user.id,
      course,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved request for this course'
      });
    }

    // Check if user is already enrolled in this course
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course,
      status: 'active'
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    const request = await TrainingRequest.create({
      user: req.user.id,
      course,
      justification,
      accessibilityRequirements
    });

    // Populate the response
    await request.populate('user', 'firstName lastName email');
    await request.populate('course', 'title code');

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update training request
// @route   PUT /api/requests/:id
// @access  Private (Admin only)
exports.updateTrainingRequest = async (req, res) => {
  try {
    const request = await TrainingRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Training request not found'
      });
    }

    // Only allow updates if request is pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a processed request'
      });
    }

    const updatedRequest = await TrainingRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'firstName lastName email')
     .populate('course', 'title code');

    res.status(200).json({
      success: true,
      data: updatedRequest
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete training request
// @route   DELETE /api/requests/:id
// @access  Private (Admin only)
exports.deleteTrainingRequest = async (req, res) => {
  try {
    const request = await TrainingRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Training request not found'
      });
    }

    // Only allow deletion if request is pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a processed request'
      });
    }

    await request.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Approve training request
// @route   PUT /api/requests/:id/approve
// @access  Private (Admin only)
exports.approveTrainingRequest = async (req, res) => {
  try {
    const request = await TrainingRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Training request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed'
      });
    }

    request.status = 'approved';
    request.approver = req.user.id;
    request.approvalDate = new Date();
    request.approvalNotes = req.body.approvalNotes || '';
    await request.save();

    // Populate the response
    await request.populate('user', 'firstName lastName email');
    await request.populate('course', 'title code');
    await request.populate('approver', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reject training request
// @route   PUT /api/requests/:id/reject
// @access  Private (Admin only)
exports.rejectTrainingRequest = async (req, res) => {
  try {
    const request = await TrainingRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Training request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed'
      });
    }

    request.status = 'rejected';
    request.approver = req.user.id;
    request.approvalDate = new Date();
    request.approvalNotes = req.body.approvalNotes || '';
    await request.save();

    // Populate the response
    await request.populate('user', 'firstName lastName email');
    await request.populate('course', 'title code');
    await request.populate('approver', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};