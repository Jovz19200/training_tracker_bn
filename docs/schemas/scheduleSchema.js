module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Unique identifier for the schedule'
    },
    course: {
      type: 'string',
      description: 'Reference to the course'
    },
    title: {
      type: 'string',
      description: 'Title of the session',
      maxLength: 100
    },
    description: {
      type: 'string',
      description: 'Description of the session'
    },
    startTime: {
      type: 'string',
      format: 'date-time',
      description: 'Start time of the session'
    },
    endTime: {
      type: 'string',
      format: 'date-time',
      description: 'End time of the session'
    },
    location: {
      type: 'string',
      description: 'Location of the session'
    },
    isVirtual: {
      type: 'boolean',
      default: false,
      description: 'Whether the session is virtual'
    },
    virtualMeetingLink: {
      type: 'string',
      description: 'Link for virtual meeting'
    },
    status: {
      type: 'string',
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
      description: 'Status of the session'
    },
    instructor: {
      type: 'string',
      description: 'Reference to the instructor'
    }
  },
  required: ['course', 'title', 'startTime', 'endTime', 'location']
}; 