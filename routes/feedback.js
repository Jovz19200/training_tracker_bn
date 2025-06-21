const express = require('express');
const {
  getCourseFeedback,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackByUser,
  getFeedbackByCourse
} = require('../controllers/feedbackController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Route for getting feedback by user
router.get('/user/:userId', getFeedbackByUser);

// Route for getting feedback by course
router.get('/course/:courseId', getFeedbackByCourse);

// Routes for feedback
router.route('/')
  .get(getCourseFeedback);

router.route('/:id')
  .get(getFeedback)
  .put(updateFeedback)
  .delete(deleteFeedback);

// Route for creating feedback for a course
router.post('/:courseId/feedback', createFeedback);

module.exports = router;