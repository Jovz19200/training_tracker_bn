const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  sessionNumber: {
    type: Number,
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
  notes: {
    type: String
  },
  verificationMethod: {
    type: String,
    enum: ['qr', 'manual', 'other'],
    default: 'qr'
  }
});

// Prevent duplicate attendance records for the same session
AttendanceSchema.index({ enrollment: 1, date: 1, sessionNumber: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);