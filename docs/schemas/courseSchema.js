module.exports = {
  type: 'object',
  required: ['title', 'description', 'duration', 'capacity', 'startDate', 'endDate', 'location'],
  properties: {
    title: {
      type: 'string',
      description: 'Course title'
    },
    description: {
      type: 'string',
      description: 'Course description'
    },
    thumbnail: {
      type: 'object',
      properties: {
        public_id: {
          type: 'string',
          description: 'Cloudinary public ID of the thumbnail'
        },
        url: {
          type: 'string',
          format: 'uri',
          description: 'URL of the thumbnail image'
        }
      }
    },
    duration: {
      type: 'number',
      description: 'Course duration in hours'
    },
    capacity: {
      type: 'number',
      description: 'Maximum number of participants'
    },
    startDate: {
      type: 'string',
      format: 'date-time',
      description: 'Course start date'
    },
    endDate: {
      type: 'string',
      format: 'date-time',
      description: 'Course end date'
    },
    location: {
      type: 'string',
      description: 'Course location'
    },
    isVirtual: {
      type: 'boolean',
      description: 'Whether the course is virtual'
    },
    virtualMeetingLink: {
      type: 'string',
      description: 'Virtual meeting link if applicable'
    },
    accessibilityFeatures: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'List of accessibility features'
    }
  }
};