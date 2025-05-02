module.exports = {
  '/api/resources': {
    post: {
      tags: ['Resources'],
      summary: 'Create a new resource',
      description: 'Create a new resource for a course',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Resource'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Resource created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Resource'
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
      tags: ['Resources'],
      summary: 'Get all resources',
      description: 'Retrieve all resources with optional filtering',
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
          name: 'fileType',
          in: 'query',
          description: 'Filter by file type',
          schema: {
            type: 'string',
            enum: ['pdf', 'doc', 'ppt', 'video', 'audio', 'image', 'other']
          }
        },
        {
          name: 'isPublic',
          in: 'query',
          description: 'Filter by public status',
          schema: {
            type: 'boolean'
          }
        }
      ],
      responses: {
        200: {
          description: 'List of resources',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Resource'
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
  '/api/resources/{id}': {
    get: {
      tags: ['Resources'],
      summary: 'Get a specific resource',
      description: 'Retrieve a specific resource by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Resource ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Resource details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Resource'
              }
            }
          }
        },
        404: {
          description: 'Resource not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    put: {
      tags: ['Resources'],
      summary: 'Update a resource',
      description: 'Update a specific resource by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Resource ID',
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
              $ref: '#/components/schemas/Resource'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Resource updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Resource'
              }
            }
          }
        },
        404: {
          description: 'Resource not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    },
    delete: {
      tags: ['Resources'],
      summary: 'Delete a resource',
      description: 'Delete a specific resource by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Resource ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        204: {
          description: 'Resource deleted successfully'
        },
        404: {
          description: 'Resource not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/resources/{id}/download': {
    get: {
      tags: ['Resources'],
      summary: 'Download a resource',
      description: 'Download a specific resource by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Resource ID',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Resource file',
          content: {
            'application/octet-stream': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        },
        404: {
          description: 'Resource not found'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  }
}; 