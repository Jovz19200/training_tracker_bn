module.exports = {
  '/api/schedules': {
    post: {
      tags: ['Schedules'],
      summary: 'Create a new schedule',
      description: 'Create a new schedule for a course',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Schedule'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Schedule created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Schedule'
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
      tags: ['Schedules'],
      summary: 'Get all schedules',
      description: 'Retrieve all schedules with optional filtering',
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
          name: 'instructor',
          in: 'query',
          description: 'Filter by instructor ID',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by schedule status',
          schema: {
            type: 'string',
            enum: ['scheduled', 'in-progress', 'completed', 'cancelled']
          }
        },
        {
          name: 'startDate',
          in: 'query',
          description: 'Filter by start date',
          schema: {
            type: 'string',
            format: 'date-time'
          }
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'Filter by end date',
          schema: {
            type: 'string',
            format: 'date-time'
          }
        }
      ],
      responses: {
        200: {
          description: 'List of schedules',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Schedule'
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
  '/api/schedules/{id}': {
    get: {
      tags: ['Schedules'],
      summary: 'Get a specific schedule',
      description: 'Retrieve a specific schedule by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Schedule details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Schedule'
              }
            }
          }
        },
        404: {
          description: 'Schedule not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    put: {
      tags: ['Schedules'],
      summary: 'Update a schedule',
      description: 'Update a specific schedule by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule ID',
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
              $ref: '#/components/schemas/Schedule'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Schedule updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Schedule'
              }
            }
          }
        },
        404: {
          description: 'Schedule not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    delete: {
      tags: ['Schedules'],
      summary: 'Delete a schedule',
      description: 'Delete a specific schedule by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        204: {
          description: 'Schedule deleted successfully'
        },
        404: {
          description: 'Schedule not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/schedules/{id}/start': {
    post: {
      tags: ['Schedules'],
      summary: 'Start a schedule',
      description: 'Mark a schedule as in-progress',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Schedule started successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Schedule'
              }
            }
          }
        },
        404: {
          description: 'Schedule not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/schedules/{id}/complete': {
    post: {
      tags: ['Schedules'],
      summary: 'Complete a schedule',
      description: 'Mark a schedule as completed',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Schedule completed successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Schedule'
              }
            }
          }
        },
        404: {
          description: 'Schedule not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/schedules/{id}/cancel': {
    post: {
      tags: ['Schedules'],
      summary: 'Cancel a schedule',
      description: 'Mark a schedule as cancelled',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule ID',
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
              type: 'object',
              properties: {
                reason: {
                  type: 'string',
                  description: 'Reason for cancellation'
                }
              },
              required: ['reason']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Schedule cancelled successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Schedule'
              }
            }
          }
        },
        404: {
          description: 'Schedule not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  }
}; 