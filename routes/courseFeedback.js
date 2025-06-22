const express = require('express');
const {
  getCourseFeedback,
  createFeedback
} = require('../controllers/feedbackController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route for getting feedback for a course (no authentication required)
router.get('/:courseId/feedback', getCourseFeedback);

// Protected route for creating feedback for a course
router.post('/:courseId/feedback', protect, createFeedback);

module.exports = router; 