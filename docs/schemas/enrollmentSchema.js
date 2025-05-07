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
    enrollmentDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the user enrolled in the course'
    },
    status: {
      type: 'string',
      enum: ['active', 'completed', 'dropped'],
      default: 'active',
      description: 'Current status of the enrollment'
    },
    completionDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the course was completed (if applicable)'
    },
    lastAccessDate: {
      type: 'string',
      format: 'date-time',
      description: 'Last date when the user accessed the course'
    },
    progress: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      default: 0,
      description: 'Course completion progress percentage'
    },
    certificate: {
      type: 'string',
      description: 'Reference to the certificate (if course is completed)'
    },
    startDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the user started the course'
    },
    endDate: {
      type: 'string',
      format: 'date-time',
      description: 'Expected completion date of the course'
    },
    notes: {
      type: 'string',
      description: 'Additional notes about the enrollment'
    },
    createdBy: {
      type: 'string',
      description: 'Reference to the admin who created the enrollment'
    },
    updatedBy: {
      type: 'string',
      description: 'Reference to the admin who last updated the enrollment'
    }
  },
  required: ['user', 'course', 'enrollmentDate', 'status']
}; 