const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  sessionNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a session title']
  },
  description: {
    type: String
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time']
  },
  location: {
    type: String
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualMeetingLink: {
    type: String
  },
  trainer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  resources: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Resource'
  }],
  materials: [{
    title: String,
    fileUrl: String,
    fileType: String
  }],
  sessionQrCode: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  }
});

// Prevent duplicate session numbers for the same course
ScheduleSchema.index({ course: 1, sessionNumber: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);