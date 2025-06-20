module.exports = {
  '/api/courses/{courseId}/feedback': {
    post: {
      tags: ['Feedback'],
      summary: 'Create new feedback',
      description: 'Create feedback for a specific course (requires enrollment)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'courseId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID of the course to provide feedback for'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                overallRating: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                  description: 'Overall rating of the course (1-5)'
                },
                contentRating: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                  description: 'Rating for course content (1-5)'
                },
                instructorRating: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                  description: 'Rating for instructor (1-5)'
                },
                facilitiesRating: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                  description: 'Rating for facilities (1-5)'
                },
                accessibilityRating: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                  description: 'Rating for accessibility (1-5)'
                },
                commentContent: {
                  type: 'string',
                  description: 'Comments about course content'
                },
                commentInstructor: {
                  type: 'string',
                  description: 'Comments about the instructor'
                },
                commentGeneral: {
                  type: 'string',
                  description: 'General comments about the course'
                },
                suggestions: {
                  type: 'string',
                  description: 'Suggestions for improvement'
                },
                isAnonymous: {
                  type: 'boolean',
                  default: false,
                  description: 'Whether the feedback is anonymous'
                }
              },
              required: ['overallRating']
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
          description: 'Invalid input or already submitted feedback'
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden - Not enrolled in course'
        },
        404: {
          description: 'Course not found'
        }
      }
    }
  },
  '/api/feedback': {
    get: {
      tags: ['Feedback'],
      summary: 'Get all feedback',
      description: 'Get all feedback (admin only)',
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
        }
      ],
      responses: {
        200: {
          description: 'List of feedback',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  feedback: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Feedback'
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
  '/api/feedback/{id}': {
    get: {
      tags: ['Feedback'],
      summary: 'Get feedback by ID',
      description: 'Get feedback by ID (admin or feedback owner)',
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
          description: 'Feedback details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Feedback'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden - Not authorized to view this feedback'
        },
        404: {
          description: 'Feedback not found'
        }
      }
    },
    put: {
      tags: ['Feedback'],
      summary: 'Update feedback',
      description: 'Update feedback (admin or feedback owner)',
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
        400: {
          description: 'Invalid input'
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden - Not authorized to update this feedback'
        },
        404: {
          description: 'Feedback not found'
        }
      }
    },
    delete: {
      tags: ['Feedback'],
      summary: 'Delete feedback',
      description: 'Delete feedback (admin or feedback owner)',
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
          description: 'Feedback deleted successfully'
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden - Not authorized to delete this feedback'
        },
        404: {
          description: 'Feedback not found'
        }
      }
    }
  },
  '/api/feedback/course/{courseId}': {
    get: {
      tags: ['Feedback'],
      summary: 'Get feedback for a course',
      description: 'Get all feedback for a specific course',
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
        }
      ],
      responses: {
        200: {
          description: 'List of feedback for the course',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  feedback: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Feedback'
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
  '/api/feedback/user/{userId}': {
    get: {
      tags: ['Feedback'],
      summary: 'Get feedback by user',
      description: 'Get all feedback provided by a specific user',
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
        }
      ],
      responses: {
        200: {
          description: 'List of feedback by the user',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  feedback: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Feedback'
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
          description: 'Forbidden - Not authorized to view this user\'s feedback'
        },
        404: {
          description: 'User not found'
        }
      }
    }
  }
}; 