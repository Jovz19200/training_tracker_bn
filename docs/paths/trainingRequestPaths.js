module.exports = {
  '/api/training-requests': {
    post: {
      tags: ['Training Requests'],
      summary: 'Create a new training request',
      description: 'Create a new training request for a course',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TrainingRequest'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Training request created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TrainingRequest'
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
      tags: ['Training Requests'],
      summary: 'Get all training requests',
      description: 'Retrieve all training requests with optional filtering',
      parameters: [
        {
          name: 'status',
          in: 'query',
          description: 'Filter by request status',
          schema: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected']
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
          name: 'course',
          in: 'query',
          description: 'Filter by course ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'List of training requests',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/TrainingRequest'
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
  '/api/training-requests/{id}': {
    get: {
      tags: ['Training Requests'],
      summary: 'Get a specific training request',
      description: 'Retrieve a specific training request by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Training request ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Training request details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TrainingRequest'
              }
            }
          }
        },
        404: {
          description: 'Training request not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    put: {
      tags: ['Training Requests'],
      summary: 'Update a training request',
      description: 'Update a specific training request by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Training request ID',
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
              $ref: '#/components/schemas/TrainingRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Training request updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TrainingRequest'
              }
            }
          }
        },
        404: {
          description: 'Training request not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    delete: {
      tags: ['Training Requests'],
      summary: 'Delete a training request',
      description: 'Delete a specific training request by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Training request ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        204: {
          description: 'Training request deleted successfully'
        },
        404: {
          description: 'Training request not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/training-requests/{id}/approve': {
    post: {
      tags: ['Training Requests'],
      summary: 'Approve a training request',
      description: 'Approve a specific training request by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Training request ID',
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
                comments: {
                  type: 'string',
                  description: 'Comments about the approval'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Training request approved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TrainingRequest'
              }
            }
          }
        },
        404: {
          description: 'Training request not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/training-requests/{id}/reject': {
    post: {
      tags: ['Training Requests'],
      summary: 'Reject a training request',
      description: 'Reject a specific training request by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Training request ID',
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
                comments: {
                  type: 'string',
                  description: 'Comments about the rejection'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Training request rejected successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TrainingRequest'
              }
            }
          }
        },
        404: {
          description: 'Training request not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  }
}; 