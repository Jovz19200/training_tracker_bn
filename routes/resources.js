const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// Routes for resources
router.route('/')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get all resources endpoint'
    });
  })
  .post(authorize('admin', 'manager'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create resource endpoint'
    });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: `Get resource ${req.params.id} endpoint`
    });
  })
  .put(authorize('admin', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update resource ${req.params.id} endpoint`
    });
  })
  .delete(authorize('admin', 'manager'), (req, res) => {
    res.status(200).json({
      success: true,
      message: `Delete resource ${req.params.id} endpoint`
    });
  });

// Route for checking resource availability
router.get('/:id/availability', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Check availability for resource ${req.params.id} endpoint`
  });
});

// Route for assigning a resource to a training session
router.post('/:id/assign/:scheduleId', authorize('admin', 'trainer', 'manager'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Assign resource ${req.params.id} to schedule ${req.params.scheduleId} endpoint`
  });
});

module.exports = router;