const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// Routes for training requests
router.route('/')
  .get(authorize('admin', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get all training requests endpoint'
    });
  })
  .post(authorize('trainee', 'trainer'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create training request endpoint'
    });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: `Get training request ${req.params.id} endpoint`
    });
  })
  .put(authorize('admin', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update training request ${req.params.id} endpoint`
    });
  })
  .delete(authorize('admin', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: `Delete training request ${req.params.id} endpoint`
    });
  });

// Route for approving a training request
router.put('/:id/approve', authorize('admin', 'manager'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Approve training request ${req.params.id} endpoint`
  });
});

// Route for rejecting a training request
router.put('/:id/reject', authorize('admin', 'manager'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Reject training request ${req.params.id} endpoint`
  });
});

module.exports = router;