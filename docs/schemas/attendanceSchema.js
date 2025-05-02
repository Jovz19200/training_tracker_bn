module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Unique identifier for the attendance record'
    },
    user: {
      type: 'string',
      description: 'Reference to the user'
    },
    course: {
      type: 'string',
      description: 'Reference to the course'
    },
    session: {
      type: 'string',
      description: 'Reference to the session'
    },
    status: {
      type: 'string',
      enum: ['present', 'absent', 'late', 'excused'],
      description: 'Attendance status'
    },
    checkInTime: {
      type: 'string',
      format: 'date-time',
      description: 'Time when the user checked in'
    },
    checkOutTime: {
      type: 'string',
      format: 'date-time',
      description: 'Time when the user checked out'
    },
    notes: {
      type: 'string',
      description: 'Additional notes about the attendance'
    },
    recordedBy: {
      type: 'string',
      description: 'Reference to the user who recorded the attendance'
    }
  },
  required: ['user', 'course', 'session', 'status']
}; 