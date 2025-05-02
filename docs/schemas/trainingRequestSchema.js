module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Unique identifier for the training request'
    },
    user: {
      type: 'string',
      description: 'Reference to the user making the request'
    },
    course: {
      type: 'string',
      description: 'Reference to the requested course'
    },
    requestDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the request was made'
    },
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      description: 'Status of the request'
    },
    reason: {
      type: 'string',
      description: 'Reason for the training request'
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      description: 'Priority level of the request'
    },
    approvedBy: {
      type: 'string',
      description: 'Reference to the user who approved/rejected the request'
    },
    approvalDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the request was approved/rejected'
    },
    comments: {
      type: 'string',
      description: 'Additional comments about the request'
    }
  },
  required: ['user', 'course', 'reason']
}; 