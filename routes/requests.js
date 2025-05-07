const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getTrainingRequests,
  getTrainingRequest,
  createTrainingRequest,
  updateTrainingRequest,
  deleteTrainingRequest,
  approveTrainingRequest,
  rejectTrainingRequest
} = require('../controllers/trainingRequestController');

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// Routes for training requests
router.route('/')
  .get(authorize('admin'), getTrainingRequests)
  .post(authorize('trainee', 'trainer'), createTrainingRequest);

router.route('/:id')
  .get(getTrainingRequest) // Accessible by admin or request owner
  .put(authorize('admin'), updateTrainingRequest)
  .delete(authorize('admin'), deleteTrainingRequest);

// Route for approving a training request (admin only)
router.put('/:id/approve', authorize('admin'), approveTrainingRequest);

// Route for rejecting a training request (admin only)
router.put('/:id/reject', authorize('admin'), rejectTrainingRequest);

module.exports = router;