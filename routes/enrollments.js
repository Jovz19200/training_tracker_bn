const express = require('express');
const {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
} = require('../controllers/enrollmentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for enrollments
router.route('/')
  .get(getEnrollments)
  .post(authorize('admin'), createEnrollment);

router.route('/:id')
  .get(getEnrollment)
  .put(authorize('admin'), updateEnrollment)
  .delete(authorize('admin'), deleteEnrollment);

// Route for enrolling in a course
router.post('/courses/:courseId/enroll', createEnrollment);

// Route for marking enrollment as completed
router.put('/:id/complete', authorize('admin', 'trainer'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Mark enrollment ${req.params.id} as completed endpoint`
  });
});

// Route for getting enrollments by course
router.get('/course/:courseId', authorize('admin', 'trainer', 'manager'), (req, res) => {
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

module.exports = router;