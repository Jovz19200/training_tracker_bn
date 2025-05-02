const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a resource name'],
    trim: true
  },
  type: {
    type: String,
    enum: ['room', 'equipment', 'material', 'other'],
    required: [true, 'Please specify resource type']
  },
  description: {
    type: String
  },
  capacity: {
    type: Number
  },
  location: {
    type: String
  },
  availability: {
    type: Boolean,
    default: true
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
    required: true
  },
  accessibilityFeatures: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);