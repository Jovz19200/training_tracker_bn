const express = require('express');
const {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getCourseEnrollmentStats,
  completeEnrollment
} = require('../controllers/enrollmentController');

const { protect, authorize } = require('../middleware/auth');
const { autoUpdateEnrollmentStatuses, getCourseEnrollmentStats: getStats, updateEnrollmentStatus } = require('../utils/enrollmentManager');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for enrollments
router.route('/')
  .get(authorize('admin', 'trainer'), getEnrollments)
  .post(authorize('admin'), createEnrollment);

router.route('/:id')
  .get(getEnrollment)
  .put(authorize('admin', 'trainer'), updateEnrollment)
  .delete(authorize('admin'), deleteEnrollment);

// Route for enrolling in a course
router.post('/courses/:courseId/enroll', createEnrollment);

// Route for marking enrollment as completed and issuing certificate
router.put('/:id/complete', authorize('admin', 'trainer'), completeEnrollment);

// Route for getting enrollments by course
router.get('/course/:courseId', authorize('admin', 'trainer'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Get enrollments for course ${req.params.courseId} endpoint`
  });
});

// Route for getting enrollments by user
router.get('/user/:userId', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Get enrollments for user ${req.params.userId} endpoint`
  });
});

// Course enrollment statistics
router.route('/course/:courseId/enrollment-stats')
  .get(authorize('admin', 'trainer', 'trainee'), getCourseEnrollmentStats);

// New routes for enrollment management
router.route('/auto-update')
  .post(authorize('admin'), async (req, res) => {
    try {
      const result = await autoUpdateEnrollmentStatuses();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

router.route('/course/:courseId/stats')
  .get(authorize('admin', 'trainer', 'trainee'), async (req, res) => {
    try {
      const stats = await getStats(req.params.courseId);
      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

router.route('/:id/status')
  .put(authorize('admin', 'trainer'), async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const result = await updateEnrollmentStatus(req.params.id, status, req.user.id);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

module.exports = router;