const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(attendanceController.getAttendances)
  .post(authorize('admin', 'trainer'), attendanceController.createAttendance);

router.route('/:id')
  .get(attendanceController.getAttendance)
  .put(authorize('admin', 'trainer'), attendanceController.updateAttendance)
  .delete(authorize('admin', 'trainer'), attendanceController.deleteAttendance);

// Manual attendance route
router.post('/manual', authorize('admin', 'trainer'), attendanceController.manualAttendance);

module.exports = router; 