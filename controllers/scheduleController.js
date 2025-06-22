const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Resource = require('../models/Resource');
const { generateQRCode } = require('../utils/qrGenerator');

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
exports.getSchedules = async (req, res) => {
  try {
    const { courseId, status, startDate, endDate } = req.query;
    
    let query = Schedule.find();
    
    // Filter by course
    if (courseId) {
      query = query.where('course', courseId);
    }
    
    // Filter by status
    if (status) {
      query = query.where('status', status);
    }
    
    // Filter by date range
    if (startDate && endDate) {
      query = query.where('startTime').gte(new Date(startDate)).lte(new Date(endDate));
    }
    
    const schedules = await query
      .populate('course', 'title')
      .populate('trainer', 'firstName lastName')
      .sort('startTime');

    // Map to calendar-friendly format
    const calendarData = schedules.map(s => ({
      start: s.startTime,
      end: s.endTime,
      title: s.course?.title || s.title,
      instructor: s.trainer ? `${s.trainer.firstName} ${s.trainer.lastName}` : '',
      sessionTitle: s.title // Optionally include session title if needed
    }));

    res.status(200).json({
      success: true,
      count: calendarData.length,
      data: calendarData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Private
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('course', 'title code description')
      .populate('trainer', 'firstName lastName email')
      .populate('resources', 'name type capacity location');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create schedule
// @route   POST /api/schedules
// @access  Private (Admin, Trainer)
exports.createSchedule = async (req, res) => {
  try {
    const {
      course,
      sessionNumber,
      title,
      description,
      startTime,
      endTime,
      location,
      isVirtual,
      virtualMeetingLink,
      trainer,
      resources,
      materials
    } = req.body;

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if session number already exists for this course
    const existingSession = await Schedule.findOne({
      course,
      sessionNumber
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: `Session number ${sessionNumber} already exists for this course`
      });
    }

    // Validate time
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check resource availability if resources are specified
    if (resources && resources.length > 0) {
      for (const resourceId of resources) {
        const resource = await Resource.findById(resourceId);
        if (!resource) {
          return res.status(404).json({
            success: false,
            message: `Resource ${resourceId} not found`
          });
        }
        
        if (!resource.availability) {
          return res.status(400).json({
            success: false,
            message: `Resource ${resource.name} is not available`
          });
        }
      }
    }

    // Create schedule
    const schedule = await Schedule.create({
      course,
      sessionNumber,
      title,
      description,
      startTime,
      endTime,
      location,
      isVirtual,
      virtualMeetingLink,
      trainer: trainer || req.user.id,
      resources,
      materials
    });

    // Generate QR code for attendance
    const qrCodeData = {
      scheduleId: schedule._id,
      courseId: course,
      sessionNumber,
      timestamp: new Date().getTime()
    };

    const qrCodeUrl = await generateQRCode(JSON.stringify(qrCodeData));
    schedule.sessionQrCode = qrCodeUrl;
    await schedule.save();

    // Populate the response
    await schedule.populate([
      {
        path: 'course',
        select: 'title code'
      },
      {
        path: 'trainer',
        select: 'firstName lastName email'
      },
      {
        path: 'resources',
        select: 'name type capacity'
      }
    ]);

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private (Admin, Trainer)
exports.updateSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check if schedule can be updated (not completed)
    if (schedule.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a completed session'
      });
    }

    // Validate time if being updated
    if (req.body.startTime && req.body.endTime) {
      if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    // Update schedule
    schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate([
      {
        path: 'course',
        select: 'title code'
      },
      {
        path: 'trainer',
        select: 'firstName lastName email'
      },
      {
        path: 'resources',
        select: 'name type capacity'
      }
    ]);

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private (Admin, Trainer)
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check if schedule can be deleted (not in progress or completed)
    if (schedule.status === 'in-progress' || schedule.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a session that is in progress or completed'
      });
    }

    await schedule.deleteOne();

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

// @desc    Get schedules by course
// @route   GET /api/schedules/course/:courseId
// @access  Private
exports.getSchedulesByCourse = async (req, res) => {
  try {
    const schedules = await Schedule.find({ course: req.params.courseId })
      .populate('trainer', 'firstName lastName email')
      .populate('resources', 'name type capacity')
      .sort('sessionNumber');

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Generate QR code for session
// @route   GET /api/schedules/:id/qrcode
// @access  Private (Admin, Trainer)
exports.generateSessionQRCode = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Generate QR code data
    const qrCodeData = {
      scheduleId: schedule._id,
      courseId: schedule.course,
      sessionNumber: schedule.sessionNumber,
      timestamp: new Date().getTime()
    };

    const qrCodeUrl = await generateQRCode(JSON.stringify(qrCodeData));
    
    // Update schedule with new QR code
    schedule.sessionQrCode = qrCodeUrl;
    await schedule.save();

    res.status(200).json({
      success: true,
      data: {
        qrCodeUrl,
        sessionId: schedule._id,
        sessionNumber: schedule.sessionNumber,
        courseId: schedule.course
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update session status
// @route   PUT /api/schedules/:id/status
// @access  Private (Admin, Trainer)
exports.updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('course', 'title code');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}; 