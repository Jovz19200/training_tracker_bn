const express = require('express');
const {
  getCourseFeedback,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

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