module.exports = {
  '/api/organizations': {
    get: {
      tags: ['Organizations'],
      summary: 'Get all organizations',
      description: 'Retrieve a list of all organizations',
      responses: {
        200: {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  count: {
                    type: 'integer',
                    example: 1
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Organization'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Organizations'],
      summary: 'Create a new organization',
      description: 'Create a new organization (Admin only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Organization'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Organization created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    $ref: '#/components/schemas/Organization'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid input'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/api/organizations/{id}': {
    get: {
      tags: ['Organizations'],
      summary: 'Get organization by ID',
      description: 'Retrieve a specific organization by its ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Organization ID'
        }
      ],
      responses: {
        200: {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    $ref: '#/components/schemas/Organization'
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Organization not found'
        }
      }
    },
    put: {
      tags: ['Organizations'],
      summary: 'Update organization',
      description: 'Update an existing organization (Admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Organization ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Organization'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Organization updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    $ref: '#/components/schemas/Organization'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid input'
        },
        401: {
          description: 'Unauthorized'
        },
        404: {
          description: 'Organization not found'
        }
      }
    },
    delete: {
      tags: ['Organizations'],
      summary: 'Delete organization',
      description: 'Delete an organization (Admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Organization ID'
        }
      ],
      responses: {
        200: {
          description: 'Organization deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        404: {
          description: 'Organization not found'
        }
      }
    }
  }
}; 