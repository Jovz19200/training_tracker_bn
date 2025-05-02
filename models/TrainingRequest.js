const mongoose = require('mongoose');

const TrainingRequestSchema = new mongoose.Schema({
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
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  justification: {
    type: String,
    required: [true, 'Please provide a justification for the training request']
  },
  approver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  approvalNotes: {
    type: String
  },
  accessibilityRequirements: {
    type: String
  }
});

module.exports = mongoose.model('TrainingRequest', TrainingRequestSchema);