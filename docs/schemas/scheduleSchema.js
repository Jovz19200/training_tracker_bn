module.exports = {
  Schedule: {
    type: 'object',
    required: ['course', 'sessionNumber', 'title', 'startTime', 'endTime', 'status'],
    properties: {
      _id: {
        type: 'string',
        description: 'Auto-generated schedule ID'
      },
      course: {
        type: 'string',
        description: 'Reference to Course model'
      },
      sessionNumber: {
        type: 'number',
        minimum: 1,
        description: 'Sequential session number within the course'
      },
      title: {
        type: 'string',
        description: 'Session title'
      },
      description: {
        type: 'string',
        description: 'Detailed session description'
      },
      startTime: {
        type: 'string',
        format: 'date-time',
        description: 'Session start time'
      },
      endTime: {
        type: 'string',
        format: 'date-time',
        description: 'Session end time'
      },
      location: {
        type: 'string',
        description: 'Physical location for the session'
      },
      isVirtual: {
        type: 'boolean',
        default: false,
        description: 'Whether this is a virtual session'
      },
      virtualMeetingLink: {
        type: 'string',
        description: 'Virtual meeting link (if isVirtual is true)'
      },
      trainer: {
        type: 'string',
        description: 'Reference to User model (trainer)'
      },
      resources: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of resource IDs assigned to this session'
      },
      materials: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of material URLs or descriptions'
      },
      status: {
        type: 'string',
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled',
        description: 'Current session status'
      },
      sessionQrCode: {
        type: 'string',
        description: 'QR code URL for attendance tracking'
      },
      createdAt: {
        type: 'string',
        format: 'date-time'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time'
      }
    }
  },
  QRCodeResponse: {
    type: 'object',
    properties: {
      qrCodeUrl: {
        type: 'string',
        description: 'Generated QR code URL'
      },
      sessionId: {
        type: 'string',
        description: 'Session ID'
      },
      sessionNumber: {
        type: 'number',
        description: 'Session number'
      },
      courseId: {
        type: 'string',
        description: 'Course ID'
      }
    }
  }
}; 