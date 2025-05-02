module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Unique identifier for the enrollment'
    },
    user: {
      type: 'string',
      description: 'Reference to the enrolled user'
    },
    course: {
      type: 'string',
      description: 'Reference to the course'
    },
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
      description: 'Status of the enrollment'
    },
    enrollmentDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the user enrolled'
    },
    completionDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the course was completed'
    },
    grade: {
      type: 'number',
      description: 'Grade received for the course'
    },
    feedback: {
      type: 'string',
      description: 'Feedback provided for the course'
    }
  },
  required: ['user', 'course']
}; 