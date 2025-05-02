module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Unique identifier for the certificate'
    },
    user: {
      type: 'string',
      description: 'Reference to the user who received the certificate'
    },
    course: {
      type: 'string',
      description: 'Reference to the course'
    },
    issueDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the certificate was issued'
    },
    expiryDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the certificate expires'
    },
    certificateNumber: {
      type: 'string',
      description: 'Unique certificate number'
    },
    status: {
      type: 'string',
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
      description: 'Status of the certificate'
    },
    verificationCode: {
      type: 'string',
      description: 'Unique code for certificate verification'
    },
    pdfUrl: {
      type: 'string',
      description: 'URL to the PDF version of the certificate'
    }
  },
  required: ['user', 'course', 'issueDate', 'certificateNumber']
}; 