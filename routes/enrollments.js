const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// Routes for enrollments
router.route('/')
  .get(authorize('admin', 'trainer', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get all enrollments endpoint'
    });
  })
  .post(authorize('admin', 'trainer', 'manager'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create enrollment endpoint'
    });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: `Get enrollment ${req.params.id} endpoint`
    });
  })
  .put(authorize('admin', 'trainer', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update enrollment ${req.params.id} endpoint`
    });
  })
  .delete(authorize('admin', 'trainer', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: `Delete enrollment ${req.params.id} endpoint`
    });
  });

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