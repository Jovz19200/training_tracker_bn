module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Unique identifier for the feedback'
    },
    user: {
      type: 'string',
      description: 'Reference to the user who provided feedback'
    },
    course: {
      type: 'string',
      description: 'Reference to the course'
    },
    rating: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
      description: 'Rating given to the course (1-5)'
    },
    comment: {
      type: 'string',
      description: 'Feedback comment'
    },
    feedbackDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the feedback was provided'
    },
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      description: 'Status of the feedback'
    },
    response: {
      type: 'string',
      description: 'Response to the feedback from admin/instructor'
    }
  },
  required: ['user', 'course', 'rating']
}; 