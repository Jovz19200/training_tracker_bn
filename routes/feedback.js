const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// Routes for feedback
router.route('/')
  .get(authorize('admin', 'trainer', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get all feedback endpoint'
    });
  })
  .post((req, res) => {
    res.status(201).json({
      success: true,
      message: 'Submit feedback endpoint'
    });
  });

router.route('/:id')
  .get(authorize('admin', 'trainer', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: `Get feedback ${req.params.id} endpoint`
    });
  })
  .put(authorize('admin'), (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update feedback ${req.params.id} endpoint`
    });
  })
  .delete(authorize('admin'), (req, res) => {
    res.status(200).json({
      success: true,
      message: `Delete feedback ${req.params.id} endpoint`
    });
  });

// Route for getting feedback by course
router.get('/course/:courseId', authorize('admin', 'trainer', 'manager'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Get feedback for course ${req.params.courseId} endpoint`
  });
});

// Route for generating feedback report
router.get('/report/:courseId', authorize('admin', 'trainer', 'manager'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Generate feedback report for course ${req.params.courseId} endpoint`
  });
});

module.exports = router;