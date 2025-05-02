module.exports = {
  '/api/attendance': {
    post: {
      tags: ['Attendance'],
      summary: 'Create a new attendance record',
      description: 'Create a new attendance record for a course session',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Attendance'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Attendance record created successfully',
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
    },
    get: {
      tags: ['Attendance'],
      summary: 'Get all attendance records',
      description: 'Retrieve all attendance records with optional filtering',
      parameters: [
        {
          name: 'course',
          in: 'query',
          description: 'Filter by course ID',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'user',
          in: 'query',
          description: 'Filter by user ID',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'session',
          in: 'query',
          description: 'Filter by session ID',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by attendance status',
          schema: {
            type: 'string',
            enum: ['present', 'absent', 'late', 'excused']
          }
        }
      ],
      responses: {
        200: {
          description: 'List of attendance records',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Attendance'
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/attendance/{id}': {
    get: {
      tags: ['Attendance'],
      summary: 'Get a specific attendance record',
      description: 'Retrieve a specific attendance record by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Attendance record ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Attendance record details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Attendance'
              }
            }
          }
        },
        404: {
          description: 'Attendance record not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    put: {
      tags: ['Attendance'],
      summary: 'Update an attendance record',
      description: 'Update a specific attendance record by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Attendance record ID',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Attendance'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Attendance record updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Attendance'
              }
            }
          }
        },
        404: {
          description: 'Attendance record not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    delete: {
      tags: ['Attendance'],
      summary: 'Delete an attendance record',
      description: 'Delete a specific attendance record by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Attendance record ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        204: {
          description: 'Attendance record deleted successfully'
        },
        404: {
          description: 'Attendance record not found'
        },
        401: {
          description: 'Unauthorized'
        }
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
  }
}; 