module.exports = {
  '/api/attendance': {
    get: {
      tags: ['Attendance'],
      summary: 'List attendance records',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'enrollment', in: 'query', schema: { type: 'string' }, description: 'Filter by enrollment ID' },
        { name: 'session', in: 'query', schema: { type: 'string' }, description: 'Filter by session (Schedule) ID' }
      ],
      responses: {
        200: {
          description: 'List of attendance records',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  count: { type: 'integer' },
                  data: { type: 'array', items: { $ref: '#/components/schemas/Attendance' } }
                }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Attendance'],
      summary: 'Create attendance record',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Attendance' }
          }
        }
      },
      responses: {
        201: { description: 'Attendance created' },
        400: { description: 'Invalid input' },
        404: { description: 'Enrollment or session not found' }
      }
    }
  },
  '/api/attendance/{id}': {
    get: {
      tags: ['Attendance'],
      summary: 'Get attendance record',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Attendance ID' }
      ],
      responses: {
        200: { description: 'Attendance record', content: { 'application/json': { schema: { $ref: '#/components/schemas/Attendance' } } } },
        404: { description: 'Attendance not found' }
      }
    },
    put: {
      tags: ['Attendance'],
      summary: 'Update attendance record',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Attendance ID' }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Attendance' }
          }
        }
      },
      responses: {
        200: { description: 'Attendance updated' },
        404: { description: 'Attendance not found' }
      }
    },
    delete: {
      tags: ['Attendance'],
      summary: 'Delete attendance record',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Attendance ID' }
      ],
      responses: {
        200: { description: 'Attendance deleted' },
        404: { description: 'Attendance not found' }
      }
    }
  },
  '/api/attendance/check-in': {
    post: {
      tags: ['Attendance'],
      summary: 'Check in a user',
      description: 'Record a user\'s check-in for a session',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                user: {
                  type: 'string',
                  description: 'User ID'
                },
                session: {
                  type: 'string',
                  description: 'Session ID'
                },
                course: {
                  type: 'string',
                  description: 'Course ID'
                }
              },
              required: ['user', 'session', 'course']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Check-in recorded successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Attendance'
              }
            }
          }
        },
        400: {
          description: 'Invalid request data'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/attendance/check-out': {
    post: {
      tags: ['Attendance'],
      summary: 'Check out a user',
      description: 'Record a user\'s check-out for a session',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                user: {
                  type: 'string',
                  description: 'User ID'
                },
                session: {
                  type: 'string',
                  description: 'Session ID'
                },
                course: {
                  type: 'string',
                  description: 'Course ID'
                }
              },
              required: ['user', 'session', 'course']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Check-out recorded successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Attendance'
              }
            }
          }
        },
        400: {
          description: 'Invalid request data'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/attendance/manual': {
    post: {
      tags: ['Attendance'],
      summary: 'Mark manual attendance for a session',
      description: 'Bulk mark attendance for multiple enrollments in a session. Only trainers and admins can use this.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                sessionId: { type: 'string', description: 'Session (Schedule) ID' },
                attendance: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      enrollmentId: { type: 'string', description: 'Enrollment ID' },
                      status: { type: 'string', enum: ['present', 'absent', 'late', 'excused'] },
                      notes: { type: 'string' },
                      excuseReason: { type: 'string' }
                    },
                    required: ['enrollmentId', 'status']
                  }
                }
              },
              required: ['sessionId', 'attendance']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Attendance marked successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  results: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        enrollmentId: { type: 'string' },
                        success: { type: 'boolean' },
                        action: { type: 'string', enum: ['created', 'updated'] },
                        message: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: { description: 'Invalid input' },
        404: { description: 'Session or enrollment not found' },
        500: { description: 'Server error' }
      }
    }
  }
}; 