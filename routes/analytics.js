const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes in this router
router.use(protect);
router.use(authorize('admin', 'manager'));

// Routes for analytics
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get dashboard analytics endpoint'
  });
});

router.get('/attendance', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get attendance analytics endpoint'
  });
});

router.get('/completion-rates', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get completion rates analytics endpoint'
  });
});

router.get('/training-costs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get training costs analytics endpoint'
  });
});

router.get('/skills-gap', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get skills gap analytics endpoint'
  });
});

router.get('/reports/generate', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Generate custom report endpoint'
  });
});

module.exports = router;