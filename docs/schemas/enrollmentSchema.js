module.exports = {
  Enrollment: {
    type: 'object',
    required: ['user', 'course', 'status'],
    properties: {
      _id: {
        type: 'string',
        description: 'Auto-generated enrollment ID'
      },
      user: {
        type: 'string',
        description: 'Reference to User model'
      },
      course: {
        type: 'string',
        description: 'Reference to Course model'
      },
      status: {
        type: 'string',
        enum: ['enrolled', 'completed', 'dropped', 'failed'],
        description: 'Current enrollment status'
      },
      enrollmentDate: {
        type: 'string',
        format: 'date-time',
        description: 'Date when user enrolled'
      },
      completionDate: {
        type: 'string',
        format: 'date-time',
        description: 'Date when course was completed'
      },
      preTestScore: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: 'Pre-course assessment score'
      },
      postTestScore: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: 'Post-course assessment score'
      },
      notes: {
        type: 'string',
        description: 'Additional notes about the enrollment'
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
  EnrollmentStats: {
    type: 'object',
    properties: {
      totalCapacity: {
        type: 'number',
        description: 'Total course capacity'
      },
      totalEnrolled: {
        type: 'number',
        description: 'Number of currently enrolled students'
      },
      totalCompleted: {
        type: 'number',
        description: 'Number of completed enrollments'
      },
      totalDropped: {
        type: 'number',
        description: 'Number of dropped enrollments'
      },
      totalFailed: {
        type: 'number',
        description: 'Number of failed enrollments'
      },
      availableSpots: {
        type: 'number',
        description: 'Remaining available spots'
      },
      enrollmentRate: {
        type: 'number',
        description: 'Percentage of capacity filled'
      }
    }
  },
  AutoUpdateResult: {
    type: 'object',
    properties: {
      updated: {
        type: 'number',
        description: 'Number of enrollments updated'
      },
      completed: {
        type: 'number',
        description: 'Number of enrollments marked as completed'
      },
      failed: {
        type: 'number',
        description: 'Number of enrollments marked as failed'
      }
    }
  }
}; 