const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
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
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  pdfUrl: {
    type: String
  },
  verificationUrl: {
    type: String
  },
  verificationQrCode: {
    type: String
  },
  status: {
    type: String,
    enum: ['issued', 'revoked', 'expired'],
    default: 'issued'
  }
});

module.exports = mongoose.model('Certificate', CertificateSchema);