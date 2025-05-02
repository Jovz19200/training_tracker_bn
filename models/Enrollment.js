const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
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
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'dropped', 'failed'],
    default: 'enrolled'
  },
  completionDate: {
    type: Date
  },
  trainingRequest: {
    type: mongoose.Schema.ObjectId,
    ref: 'TrainingRequest'
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateId: {
    type: String
  },
  preTestScore: {
    type: Number
  },
  postTestScore: {
    type: Number
  },
  notes: {
    type: String
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate attendances
EnrollmentSchema.virtual('attendances', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'enrollment',
  justOne: false
});

// Prevent user from enrolling in same course twice
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);