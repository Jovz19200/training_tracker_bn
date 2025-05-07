module.exports = {
  TrainingRequest: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        description: 'Training request ID'
      },
      user: {
        type: 'string',
        description: 'User ID who made the request'
      },
      course: {
        type: 'string',
        description: 'Course ID being requested'
      },
      requestDate: {
        type: 'string',
        format: 'date-time',
        description: 'Date when the request was made'
      },
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending',
        description: 'Current status of the request'
      },
      justification: {
        type: 'string',
        description: 'Reason for requesting the training'
      },
      approver: {
        type: 'string',
        description: 'Admin ID who approved/rejected the request'
      },
      approvalDate: {
        type: 'string',
        format: 'date-time',
        description: 'Date when the request was approved/rejected'
      },
      approvalNotes: {
        type: 'string',
        description: 'Notes from the admin about the approval/rejection'
      },
      accessibilityRequirements: {
        type: 'string',
        description: 'Any special accessibility requirements'
      }
    },
    required: ['user', 'course', 'requestDate', 'status', 'justification']
  }
}; 