module.exports = {
  '/api/users': {
    get: {
      tags: ['Users'],
      summary: 'Get all users',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  count: {
                    type: 'number'
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Not authorized'
        }
      }
    },
    post: {
      tags: ['Users'],
      summary: 'Create new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get single user',
      description: 'Get details of a specific user (Admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID',
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'User details retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        401: { description: 'Unauthorized - Invalid or missing token' },
        403: { description: 'Forbidden - User does not have admin role' },
        404: { description: 'User not found' }
      }
    },
    put: {
      tags: ['Users'],
      summary: 'Update user',
      description: 'Update user details including role (Admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID',
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                role: {
                  type: 'string',
                  enum: ['trainee', 'trainer', 'admin'],
                  description: 'User role'
                },
                organization: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'User updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        401: { description: 'Unauthorized - Invalid or missing token' },
        403: { description: 'Forbidden - User does not have admin role' },
        404: { description: 'User not found' }
      }
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete user',
      description: 'Delete a user account (Admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID',
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'User deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { type: 'object' }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized - Invalid or missing token' },
        403: { description: 'Forbidden - User does not have admin role' },
        404: { description: 'User not found' }
      }
    }
  },
  '/users/{id}/disability': {
    get: {
      summary: 'Get disability info for a user',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          schema: { type: 'string' },
          required: true,
          description: 'User ID'
        }
      ],
      responses: {
        200: {
          description: 'Disability info',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      hasDisability: { type: 'boolean' },
                      disabilityType: { type: 'string' },
                      accessibilityNeeds: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        403: { description: 'Not authorized' },
        404: { description: 'User not found' }
      }
    },
    put: {
      summary: 'Update disability info for a user',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          schema: { type: 'string' },
          required: true,
          description: 'User ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                hasDisability: { type: 'boolean' },
                disabilityType: { type: 'string' },
                accessibilityNeeds: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Updated disability info',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      hasDisability: { type: 'boolean' },
                      disabilityType: { type: 'string' },
                      accessibilityNeeds: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        403: { description: 'Not authorized' },
        404: { description: 'User not found' }
      }
    }
  }
};