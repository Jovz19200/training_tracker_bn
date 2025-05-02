const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
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
  enrollment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  overallRating: {
    type: Number,
    required: [true, 'Please provide an overall rating'],
    min: 1,
    max: 5
  },
  contentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  instructorRating: {
    type: Number,
    min: 1,
    max: 5
  },
  facilitiesRating: {
    type: Number,
    min: 1,
    max: 5
  },
  accessibilityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  commentContent: {
    type: String
  },
  commentInstructor: {
    type: String
  },
  commentGeneral: {
    type: String
  },
  suggestions: {
    type: String
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
});

// Prevent duplicate feedback submissions
FeedbackSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);