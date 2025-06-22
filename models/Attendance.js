const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  session: {
    type: mongoose.Schema.ObjectId,
    ref: 'Schedule',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
  },
  verificationMethod: {
    type: String,
    enum: ['qr', 'manual', 'other'],
    default: 'qr'
  },
  notes: {
    type: String
  },
  excuseReason: {
    type: String
  }
});

// Prevent duplicate attendance records for the same enrollment and session
AttendanceSchema.index({ enrollment: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);