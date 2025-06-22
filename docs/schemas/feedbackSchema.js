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
    enrollment: {
      type: 'string',
      description: 'Reference to the enrollment (required for feedback eligibility)'
    },
    submissionDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the feedback was submitted'
    },
    overallRating: {
      type: 'number',
      minimum: 1,
      maximum: 5,
      description: 'Overall rating of the course (1-5)'
    },
    contentRating: {
      type: 'number',
      minimum: 1,
      maximum: 5,
      description: 'Rating for course content (1-5)'
    },
    instructorRating: {
      type: 'number',
      minimum: 1,
      maximum: 5,
      description: 'Rating for instructor (1-5)'
    },
    facilitiesRating: {
      type: 'number',
      minimum: 1,
      maximum: 5,
      description: 'Rating for facilities (1-5)'
    },
    accessibilityRating: {
      type: 'number',
      minimum: 1,
      maximum: 5,
      description: 'Rating for accessibility (1-5)'
    },
    commentContent: {
      type: 'string',
      description: 'Comments about course content'
    },
    commentInstructor: {
      type: 'string',
      description: 'Comments about the instructor'
    },
    commentGeneral: {
      type: 'string',
      description: 'General comments about the course'
    },
    suggestions: {
      type: 'string',
      description: 'Suggestions for improvement'
    },
    isAnonymous: {
      type: 'boolean',
      default: false,
      description: 'Whether the feedback is anonymous'
    }
  },
  required: ['user', 'course', 'enrollment', 'overallRating']
}; 