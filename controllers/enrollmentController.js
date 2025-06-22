const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { sendEmail } = require('../utils/notificationService');
const enrollmentConfirmationTemplate = require('../templates/emails/enrollmentConfirmation');
const Certificate = require('../models/Certificate');
const { generateCertificateQR } = require('../utils/qrGenerator');
const { generateCertificatePDF } = require('../utils/pdfGenerator');
const Organization = require('../models/Organization');
const certificateIssuedTemplate = require('../templates/emails/certificateIssued');

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
      select: 'title startDate endDate instructor capacity'
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
        select: 'title startDate endDate instructor capacity'
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

// @desc    Create enrollment (Direct enrollment with capacity check)
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

    // Check if course is active/enrolling
    if (course.status !== 'scheduled' && course.status !== 'enrolling') {
      return res.status(400).json({
        success: false,
        message: 'Course is not accepting enrollments at this time'
      });
    }

    // Check if course has started
    if (new Date() > new Date(course.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Course has already started. Late enrollment not allowed.'
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

    // Check course capacity
    const currentEnrollments = await Enrollment.countDocuments({ 
      course: req.params.courseId,
      status: { $in: ['enrolled', 'completed'] }
    });

    if (currentEnrollments >= course.capacity) {
      return res.status(400).json({
        success: false,
        message: `Course is full. Capacity: ${course.capacity}, Current enrollments: ${currentEnrollments}`
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: req.params.courseId,
      status: 'enrolled',
      enrollmentDate: new Date()
    });

    // Populate enrollment for email
    await enrollment.populate([
      {
        path: 'course',
        select: 'title startDate endDate instructor location code'
      },
      {
        path: 'user',
        select: 'firstName lastName email'
      }
    ]);

    // Send enrollment confirmation email using the new template
    try {
      const emailHtml = enrollmentConfirmationTemplate(
        enrollment.user,
        enrollment.course,
        enrollment
      );

      await sendEmail({
        email: enrollment.user.email,
        subject: `🎓 Enrollment Confirmed - ${enrollment.course.title}`,
        message: emailHtml
      });
    } catch (emailError) {
      console.error('Failed to send enrollment email:', emailError);
      // Don't fail the enrollment if email fails
    }

    // Check for accessibility match and add warning if needed
    if (req.user.hasDisability && req.user.accessibilityNeeds && course.accessibilityFeatures && !course.accessibilityFeatures.includes(req.user.accessibilityNeeds)) {
      return res.status(201).json({
        success: true,
        data: enrollment,
        warning: `Course may not fully support your accessibility need: ${req.user.accessibilityNeeds}`
      });
    }

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Enrollment successful! Check your email for confirmation.'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get course enrollment statistics
// @route   GET /api/courses/:courseId/enrollment-stats
// @access  Private (Admin, Trainer)
exports.getCourseEnrollmentStats = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId });
    
    const stats = {
      totalCapacity: course.capacity,
      totalEnrolled: enrollments.filter(e => e.status === 'enrolled').length,
      totalCompleted: enrollments.filter(e => e.status === 'completed').length,
      totalDropped: enrollments.filter(e => e.status === 'dropped').length,
      totalFailed: enrollments.filter(e => e.status === 'failed').length,
      availableSpots: course.capacity - enrollments.filter(e => ['enrolled', 'completed'].includes(e.status)).length,
      enrollmentRate: course.capacity > 0 ? Math.round((enrollments.filter(e => ['enrolled', 'completed'].includes(e.status)).length / course.capacity) * 100) : 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({
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
      updateFields.completionDate = new Date();
    }

    enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true
      }
    ).populate([
      {
        path: 'course',
        select: 'title startDate endDate instructor'
      },
      {
        path: 'user',
        select: 'firstName lastName email'
      }
    ]);

    // Send status update email if status changed
    if (updateFields.status && updateFields.status !== 'enrolled') {
      try {
        const statusMessages = {
          'completed': 'Congratulations! You have successfully completed the course.',
          'dropped': 'Your enrollment has been dropped from the course.',
          'failed': 'Your enrollment status has been marked as failed.'
        };

        await sendEmail({
          email: enrollment.user.email,
          subject: `Enrollment Status Update - ${enrollment.course.title}`,
          message: `
            <h2>Enrollment Status Update</h2>
            <p>Dear ${enrollment.user.firstName} ${enrollment.user.lastName},</p>
            <p>${statusMessages[updateFields.status] || 'Your enrollment status has been updated.'}</p>
            
            <h3>Course Details:</h3>
            <ul>
              <li><strong>Course:</strong> ${enrollment.course.title}</li>
              <li><strong>Status:</strong> ${updateFields.status}</li>
              <li><strong>Update Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            
            <p>If you have any questions, please contact your course instructor or the training department.</p>
            
            <p>Best regards,<br>Training Team</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }

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

// @desc    Mark enrollment as completed and issue certificate
// @route   PUT /api/enrollments/:id/complete
// @access  Private/Admin, Trainer
exports.completeEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate({
      path: 'user',
      populate: { path: 'organization', select: 'name' }
    }).populate('course');
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    if (enrollment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Enrollment already completed' });
    }
    // Mark as completed
    enrollment.status = 'completed';
    enrollment.completionDate = new Date();
    await enrollment.save();

    // Generate unique certificate number
    const certificateNumber = `CERT-${enrollment._id.toString().slice(-6).toUpperCase()}-${Date.now()}`;

    // Create certificate
    const certificate = await Certificate.create({
      user: enrollment.user._id,
      course: enrollment.course._id,
      enrollment: enrollment._id,
      certificateNumber,
      issueDate: new Date(),
      verificationUrl: `${process.env.APP_URL}/certificate/verify/${certificateNumber}`
    });

    // Generate QR code for verification
    const qrCode = await generateCertificateQR(certificateNumber);
    certificate.verificationQrCode = qrCode;

    // Generate professional, disability-focused PDF certificate
    const orgName = enrollment.user.organization?.name || 'Organization';
    const pdfPath = await generateCertificatePDF({
      user: enrollment.user,
      course: enrollment.course,
      certificateNumber,
      issueDate: certificate.issueDate,
      orgName,
      courseId: enrollment.course._id,
      enrollmentId: enrollment._id
    });
    
    // Store the proper URL for the PDF
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.HOSTED_OTMS_FN_URL 
      : process.env.FRONTEND_URL || 'http://localhost:5000';
    certificate.pdfUrl = `${baseUrl}/${pdfPath.replace(/\\/g, '/')}`;
    await certificate.save();

    // Send certificate issued email using the template, attach the PDF
    try {
      const emailHtml = certificateIssuedTemplate(enrollment.user, enrollment.course, certificate, orgName)
        .replace(/<a [^>]*href=\"[^\"]*pdfUrl[^>]*>.*?<\/a>/g, ''); // Remove download link if present
      await sendEmail({
        email: enrollment.user.email,
        subject: `🎓 Certificate Issued - ${enrollment.course.title}`,
        message: emailHtml,
        attachments: [
          {
            filename: `Certificate-${certificate.certificateNumber}.pdf`,
            path: pdfPath,
            contentType: 'application/pdf'
          }
        ]
      });
    } catch (emailError) {
      console.error('Failed to send certificate email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Enrollment marked as completed and certificate issued.',
      data: { enrollment, certificate }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadCertificate = async (req, res) => {
  const pathLib = require('path');
  const fs = require('fs');
  const filename = req.params.filename;
  const filePath = pathLib.join(__dirname, '..', 'uploads', 'certificates', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }
  res.download(filePath, filename);
};

exports.previewCertificate = async (req, res) => {
  const pathLib = require('path');
  const fs = require('fs');
  const filename = req.params.filename;
  const filePath = pathLib.join(__dirname, '..', 'uploads', 'certificates', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=\"${filename}\"`);
  fs.createReadStream(filePath).pipe(res);
};

exports.getCertificateFiles = async (req, res) => {
  const pathLib = require('path');
  const fs = require('fs');
  try {
    const certDir = pathLib.join('uploads', 'certificates');
    if (!fs.existsSync(certDir)) {
      return res.status(200).json({ success: true, data: [] });
    }
    const files = fs.readdirSync(certDir);
    const certificateFiles = files.map(filename => {
      const filePath = pathLib.join(certDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        downloadUrl: `/api/certificates/download/${filename}`,
        previewUrl: `/api/certificates/preview/${filename}`
      };
    }).sort((a, b) => b.createdAt - a.createdAt);
    res.status(200).json({ success: true, data: certificateFiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 