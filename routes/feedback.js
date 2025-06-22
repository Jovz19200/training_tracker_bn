const express = require('express');
const {
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackByUser,
  getFeedbackByCourse,
  getAllFeedback
} = require('../controllers/feedbackController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All feedback routes require authentication
router.use(protect);

// Route for getting all feedback (admin only)
router.get('/', authorize('admin'), getAllFeedback);

// Route for getting feedback by user
router.get('/user/:userId', getFeedbackByUser);

// Route for getting feedback by course (protected)
router.get('/course/:courseId', getFeedbackByCourse);

// Routes for individual feedback
router.route('/:id')
  .get(getFeedback)
  .put(updateFeedback)
  .delete(deleteFeedback);

module.exports = router;