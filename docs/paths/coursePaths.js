module.exports = {
  '/api/courses': {
    get: {
      tags: ['Courses'],
      summary: 'Get all courses',
      parameters: [
        {
          in: 'query',
          name: 'select',
          schema: {
            type: 'string'
          },
          description: 'Fields to select'
        },
        {
          in: 'query',
          name: 'sort',
          schema: {
            type: 'string'
          },
          description: 'Sort criteria'
        },
        {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer'
          },
          description: 'Page number'
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer'
          },
          description: 'Results per page'
        }
      ],
      responses: {
        200: {
          description: 'List of courses retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  count: { type: 'number' },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Course'
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
      tags: ['Courses'],
      summary: 'Create new course',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['title', 'thumbnail', 'organization','description', 'duration', 'capacity', 'startDate', 'endDate', 'location'],
              properties: {
                title: {
                  type: 'string',
                  description: 'Course title'
                },
                description: {
                  type: 'string',
                  description: 'Course description'
                },
                thumbnail: {
                  type: 'string',
                  format: 'binary',
                  description: 'Course thumbnail image (jpg, jpeg, png)'
                },
                duration: {
                  type: 'number',
                  description: 'Course duration in hours'
                },
                organization: {
                  type: 'string',
                  description: 'Organization name'
                },
                capacity: {
                  type: 'number',
                  description: 'Maximum number of participants'
                },
                startDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Course start date'
                },
                endDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Course end date'
                },
                location: {
                  type: 'string',
                  description: 'Course location'
                },
                isVirtual: {
                  type: 'boolean',
                  description: 'Whether the course is virtual'
                },
                virtualMeetingLink: {
                  type: 'string',
                  description: 'Virtual meeting link if applicable'
                },
                accessibilityFeatures: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'List of accessibility features'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Course created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    $ref: '#/components/schemas/Course'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/courses/organization/{organizationId}': {
    get: {
      tags: ['Courses'],
      summary: 'Get courses by organization',
      parameters: [
        {
          name: 'organizationId',
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
          description: 'List of courses for the organization retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  count: { type: 'number' },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Course'
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/courses/{id}': {
    get: {
      tags: ['Courses'],
      summary: 'Get single course',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Course ID'
        }
      ],
      responses: {
        200: {
          description: 'Course retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    $ref: '#/components/schemas/Course'
                  }
                }
              }
            }
          }
        }
      }
    },
    put: {
      tags: ['Courses'],
      summary: 'Update course',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Course ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Course title'
                },
                description: {
                  type: 'string',
                  description: 'Course description'
                },
                thumbnail: {
                  type: 'string',
                  format: 'binary',
                  description: 'Course thumbnail image (jpg, jpeg, png)'
                },
                duration: {
                  type: 'number',
                  description: 'Course duration in hours'
                },
                capacity: {
                  type: 'number',
                  description: 'Maximum number of participants'
                },
                startDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Course start date'
                },
                endDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Course end date'
                },
                location: {
                  type: 'string',
                  description: 'Course location'
                },
                isVirtual: {
                  type: 'boolean',
                  description: 'Whether the course is virtual'
                },
                virtualMeetingLink: {
                  type: 'string',
                  description: 'Virtual meeting link if applicable'
                },
                accessibilityFeatures: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'List of accessibility features'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Course updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    $ref: '#/components/schemas/Course'
                  }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Courses'],
      summary: 'Delete course',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Course ID'
        }
      ],
      responses: {
        200: {
          description: 'Course deleted successfully',
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
        }
      }
    }
  }
};