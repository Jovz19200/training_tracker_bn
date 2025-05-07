module.exports = {
  '/api/enrollments': {
    post: {
      tags: ['Enrollments'],
      summary: 'Create new enrollment',
      description: 'Enroll a user in a course (admin only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                user: {
                  type: 'string',
                  description: 'ID of the user to enroll'
                },
                course: {
                  type: 'string',
                  description: 'ID of the course to enroll in'
                },
                status: {
                  type: 'string',
                  enum: ['active', 'completed', 'dropped'],
                  default: 'active',
                  description: 'Initial enrollment status'
                }
              },
              required: ['user', 'course']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Enrollment created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Enrollment'
              }
            }
          }
        },
        400: {
          description: 'Invalid input or course is full'
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden - Admin access required'
        },
        404: {
          description: 'User or course not found'
        }
      }
    },
    get: {
      tags: ['Enrollments'],
      summary: 'Get all enrollments',
      description: 'Get all enrollments (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            default: 1
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            default: 10
          }
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by enrollment status',
          schema: {
            type: 'string',
            enum: ['active', 'completed', 'dropped']
          }
        }
      ],
      responses: {
        200: {
          description: 'List of enrollments',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  enrollments: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Enrollment'
                    }
                  },
                  pagination: {
                    $ref: '#/components/schemas/Pagination'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden - Admin access required'
        }
      }
    }
  },
  '/api/enrollments/{id}': {
    get: {
      tags: ['Enrollments'],
      summary: 'Get enrollment by ID',
      description: 'Get enrollment details by ID (admin or enrollment owner)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Enrollment details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Enrollment'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden - Not authorized to view this enrollment'
        },
        404: {
          description: 'Enrollment not found'
        }
      }
    },
    put: {
      tags: ['Enrollments'],
      summary: 'Update enrollment',
      description: 'Update enrollment status (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
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
                status: {
                  type: 'string',
                  enum: ['active', 'completed', 'dropped'],
                  description: 'New enrollment status'
                },
                completionDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Date when the course was completed (required if status is completed)'
                },
                progress: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  description: 'Course completion progress percentage'
                }
              },
              required: ['status']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Enrollment updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Enrollment'
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
        403: {
          description: 'Forbidden - Admin access required'
        },
        404: {
          description: 'Enrollment not found'
        }
      }
    },
    delete: {
      tags: ['Enrollments'],
      summary: 'Delete enrollment',
      description: 'Delete enrollment (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Enrollment deleted successfully'
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden - Admin access required'
        },
        404: {
          description: 'Enrollment not found'
        }
      }
    }
  },
  '/api/enrollments/course/{courseId}': {
    get: {
      tags: ['Enrollments'],
      summary: 'Get enrollments for a course',
      description: 'Get all enrollments for a specific course',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'courseId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            default: 1
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            default: 10
          }
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by enrollment status',
          schema: {
            type: 'string',
            enum: ['active', 'completed', 'dropped']
          }
        }
      ],
      responses: {
        200: {
          description: 'List of enrollments for the course',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  enrollments: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Enrollment'
                    }
                  },
                  pagination: {
                    $ref: '#/components/schemas/Pagination'
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
          description: 'Course not found'
        }
      }
    }
  },
  '/api/enrollments/user/{userId}': {
    get: {
      tags: ['Enrollments'],
      summary: 'Get enrollments by user',
      description: 'Get all enrollments for a specific user',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            default: 1
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            default: 10
          }
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by enrollment status',
          schema: {
            type: 'string',
            enum: ['active', 'completed', 'dropped']
          }
        }
      ],
      responses: {
        200: {
          description: 'List of enrollments for the user',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  enrollments: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Enrollment'
                    }
                  },
                  pagination: {
                    $ref: '#/components/schemas/Pagination'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden - Not authorized to view this user\'s enrollments'
        },
        404: {
          description: 'User not found'
        }
      }
    }
  }
}; 