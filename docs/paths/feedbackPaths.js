module.exports = {
  '/api/feedback': {
    post: {
      tags: ['Feedback'],
      summary: 'Create a new feedback',
      description: 'Create a new feedback for a course',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Feedback'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Feedback created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Feedback'
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
      tags: ['Feedback'],
      summary: 'Get all feedback',
      description: 'Retrieve all feedback with optional filtering',
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
          name: 'status',
          in: 'query',
          description: 'Filter by feedback status',
          schema: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected']
          }
        }
      ],
      responses: {
        200: {
          description: 'List of feedback',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Feedback'
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
  '/api/feedback/{id}': {
    get: {
      tags: ['Feedback'],
      summary: 'Get a specific feedback',
      description: 'Retrieve a specific feedback by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Feedback ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Feedback details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Feedback'
              }
            }
          }
        },
        404: {
          description: 'Feedback not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    put: {
      tags: ['Feedback'],
      summary: 'Update a feedback',
      description: 'Update a specific feedback by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Feedback ID',
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
              $ref: '#/components/schemas/Feedback'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Feedback updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Feedback'
              }
            }
          }
        },
        404: {
          description: 'Feedback not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    delete: {
      tags: ['Feedback'],
      summary: 'Delete a feedback',
      description: 'Delete a specific feedback by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Feedback ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        204: {
          description: 'Feedback deleted successfully'
        },
        404: {
          description: 'Feedback not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/feedback/{id}/respond': {
    post: {
      tags: ['Feedback'],
      summary: 'Respond to a feedback',
      description: 'Add a response to a specific feedback',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Feedback ID',
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
                response: {
                  type: 'string',
                  description: 'Response to the feedback'
                }
              },
              required: ['response']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Response added successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Feedback'
              }
            }
          }
        },
        404: {
          description: 'Feedback not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  }
}; 