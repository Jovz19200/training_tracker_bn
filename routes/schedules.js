const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByCourse,
  generateSessionQRCode,
  updateSessionStatus
} = require('../controllers/scheduleController');

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// Routes for schedule management
router.route('/')
  .get(getSchedules)
  .post(authorize('admin', 'trainer'), createSchedule);

router.route('/:id')
  .get(getSchedule)
  .put(authorize('admin', 'trainer'), updateSchedule)
  .delete(authorize('admin', 'trainer'), deleteSchedule);

// Course-specific schedules
router.route('/course/:courseId')
  .get(getSchedulesByCourse);

// QR code generation
router.route('/:id/qrcode')
  .get(authorize('admin', 'trainer'), generateSessionQRCode);

// Status updates
router.route('/:id/status')
  .put(authorize('admin', 'trainer'), updateSessionStatus);

module.exports = router;