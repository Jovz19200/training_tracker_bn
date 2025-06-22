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
  },
  '/api/courses/{id}/materials': {
    get: {
      tags: ['Courses'],
      summary: 'List all materials for a course',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Course ID'
        }
      ],
      responses: {
        200: {
          description: 'List of materials',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        fileUrl: { type: 'string' },
                        fileType: { type: 'string' },
                        uploadDate: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: { description: 'Course not found' }
      }
    },
    post: {
      tags: ['Courses'],
      summary: 'Upload a material to a course',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
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
                file: {
                  type: 'string',
                  format: 'binary',
                  description: 'Material file (PDF, doc, ppt, video, audio, image, etc.)'
                },
                title: {
                  type: 'string',
                  description: 'Optional title for the material'
                }
              },
              required: ['file']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Material uploaded successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      fileUrl: { type: 'string' },
                      fileType: { type: 'string' },
                      uploadDate: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        400: { description: 'No file uploaded or invalid request' },
        404: { description: 'Course not found' }
      }
    }
  },
  '/api/courses/{id}/materials/{materialId}': {
    delete: {
      tags: ['Courses'],
      summary: 'Delete a material from a course',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Course ID'
        },
        {
          name: 'materialId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Material ID'
        }
      ],
      responses: {
        200: { description: 'Material deleted' },
        404: { description: 'Course or material not found' }
      }
    }
  },
  '/api/courses/{id}/materials/{materialId}/download': {
    get: {
      tags: ['Courses'],
      summary: 'Download a material file',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Course ID'
        },
        {
          name: 'materialId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Material ID'
        }
      ],
      responses: {
        200: { description: 'File download' },
        404: { description: 'Course, material, or file not found' }
      }
    }
  }
};