/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       required:
 *         - user
 *         - course
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated enrollment ID
 *         user:
 *           type: string
 *           description: Reference to User model
 *         course:
 *           type: string
 *           description: Reference to Course model
 *         status:
 *           type: string
 *           enum: [enrolled, completed, dropped, failed]
 *           description: Current enrollment status
 *         enrollmentDate:
 *           type: string
 *           format: date-time
 *           description: Date when user enrolled
 *         completionDate:
 *           type: string
 *           format: date-time
 *           description: Date when course was completed
 *         preTestScore:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Pre-course assessment score
 *         postTestScore:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Post-course assessment score
 *         notes:
 *           type: string
 *           description: Additional notes about the enrollment
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     EnrollmentStats:
 *       type: object
 *       properties:
 *         totalCapacity:
 *           type: number
 *           description: Total course capacity
 *         totalEnrolled:
 *           type: number
 *           description: Number of currently enrolled students
 *         totalCompleted:
 *           type: number
 *           description: Number of completed enrollments
 *         totalDropped:
 *           type: number
 *           description: Number of dropped enrollments
 *         totalFailed:
 *           type: number
 *           description: Number of failed enrollments
 *         availableSpots:
 *           type: number
 *           description: Remaining available spots
 *         enrollmentRate:
 *           type: number
 *           description: Percentage of capacity filled
 * 
 *     AutoUpdateResult:
 *       type: object
 *       properties:
 *         updated:
 *           type: number
 *           description: Number of enrollments updated
 *         completed:
 *           type: number
 *           description: Number of enrollments marked as completed
 *         failed:
 *           type: number
 *           description: Number of enrollments marked as failed
 */

module.exports = {
  '/api/enrollments': {
    get: {
      summary: 'Get all enrollments',
      description: 'Retrieve all enrollments. Only admins and trainers can access this.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'course',
          schema: { type: 'string' },
          description: 'Filter by course ID'
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['enrolled', 'completed', 'dropped', 'failed']
          },
          description: 'Filter by enrollment status'
        },
        {
          in: 'query',
          name: 'user',
          schema: { type: 'string' },
          description: 'Filter by user ID'
        }
      ],
      responses: {
        200: {
          description: 'List of enrollments retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  count: { type: 'number' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Enrollment' }
                  }
                }
              }
            }
          }
        },
        401: { description: 'Not authorized' },
        500: { description: 'Server error' }
      }
    },
    post: {
      summary: 'Create enrollment',
      description: 'Create a new enrollment. Only admins can create enrollments.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['user', 'course'],
              properties: {
                user: { type: 'string', description: 'User ID' },
                course: { type: 'string', description: 'Course ID' },
                status: {
                  type: 'string',
                  enum: ['enrolled', 'completed', 'dropped', 'failed'],
                  default: 'enrolled'
                }
              }
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
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Enrollment' }
                }
              }
            }
          }
        },
        400: { description: 'Invalid input' },
        403: { description: 'Not authorized' },
        500: { description: 'Server error' }
      }
    }
  },

  '/api/courses/{courseId}/enroll': {
    post: {
      summary: 'Enroll in a course',
      description: 'Enroll the authenticated user in a specific course. This endpoint allows users to self-enroll in courses with automatic capacity checking and validation.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string' },
          description: 'Course ID to enroll in'
        }
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'No request body required for self-enrollment'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Enrollment successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Enrollment' },
                  message: { type: 'string' },
                  warning: { 
                    type: 'string',
                    description: 'Accessibility mismatch warning (if applicable)'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Enrollment failed',
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
        },
        401: { description: 'Not authenticated' },
        404: { description: 'Course not found' },
        500: { description: 'Server error' }
      }
    }
  },

  '/api/enrollments/{id}': {
    get: {
      summary: 'Get single enrollment',
      description: 'Retrieve a specific enrollment by ID. Users can only access their own enrollments unless they are admin.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Enrollment ID'
        }
      ],
      responses: {
        200: {
          description: 'Enrollment retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Enrollment' }
                }
              }
            }
          }
        },
        404: { description: 'Enrollment not found' },
        403: { description: 'Not authorized to access this enrollment' },
        500: { description: 'Server error' }
      }
    },
    put: {
      summary: 'Update enrollment',
      description: 'Update enrollment status and details. Only admins and trainers can update enrollments.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Enrollment ID'
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
                  enum: ['enrolled', 'completed', 'dropped', 'failed']
                },
                completionDate: {
                  type: 'string',
                  format: 'date-time'
                },
                preTestScore: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100
                },
                postTestScore: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100
                },
                notes: { type: 'string' }
              }
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
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Enrollment' }
                }
              }
            }
          }
        },
        400: { description: 'Invalid input' },
        404: { description: 'Enrollment not found' },
        403: { description: 'Not authorized' },
        500: { description: 'Server error' }
      }
    },
    delete: {
      summary: 'Delete enrollment',
      description: 'Delete an enrollment. Only admins can delete enrollments.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Enrollment ID'
        }
      ],
      responses: {
        200: { description: 'Enrollment deleted successfully' },
        404: { description: 'Enrollment not found' },
        403: { description: 'Not authorized' },
        500: { description: 'Server error' }
      }
    }
  },

  '/api/enrollments/{id}/complete': {
    put: {
      summary: 'Manually complete enrollment and issue certificate',
      description: 'Mark an enrollment as completed, generate a certificate, and send a certificate email to the user. Only admins and trainers can use this.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Enrollment ID to complete'
        }
      ],
      responses: {
        200: {
          description: 'Enrollment marked as completed and certificate issued',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      enrollment: { $ref: '#/components/schemas/Enrollment' },
                      certificate: { $ref: '#/components/schemas/Certificate' }
                    }
                  }
                }
              }
            }
          }
        },
        400: { description: 'Enrollment already completed or invalid' },
        404: { description: 'Enrollment not found' },
        403: { description: 'Not authorized' },
        500: { description: 'Server error' }
      }
    }
  },

  '/api/enrollments/{id}/status': {
    put: {
      summary: 'Update enrollment status',
      description: 'Update the status of a specific enrollment. Only admins and trainers can update statuses.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Enrollment ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: {
                  type: 'string',
                  enum: ['enrolled', 'completed', 'dropped', 'failed'],
                  description: 'New enrollment status'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Enrollment status updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Enrollment' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        400: { description: 'Invalid status or enrollment not found' },
        403: { description: 'Not authorized' },
        500: { description: 'Server error' }
      }
    }
  },

  '/api/enrollments/auto-update': {
    post: {
      summary: 'Auto-update enrollment statuses',
      description: 'Automatically update enrollment statuses based on course end dates and attendance. Admin only.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Enrollment statuses updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/AutoUpdateResult' }
                }
              }
            }
          }
        },
        403: { description: 'Not authorized' },
        500: { description: 'Server error' }
      }
    }
  },

  '/api/enrollments/course/{courseId}/enrollment-stats': {
    get: {
      summary: 'Get course enrollment statistics',
      description: 'Retrieve enrollment statistics for a specific course. Only admins and trainers can access this.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string' },
          description: 'Course ID'
        }
      ],
      responses: {
        200: {
          description: 'Course enrollment statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/EnrollmentStats' }
                }
              }
            }
          }
        },
        404: { description: 'Course not found' },
        403: { description: 'Not authorized' },
        500: { description: 'Server error' }
      }
    }
  },

  '/api/enrollments/course/{courseId}/stats': {
    get: {
      summary: 'Get detailed course enrollment statistics',
      description: 'Retrieve detailed enrollment statistics for a specific course. Only admins and trainers can access this.',
      tags: ['Enrollments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string' },
          description: 'Course ID'
        }
      ],
      responses: {
        200: {
          description: 'Detailed course enrollment statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/EnrollmentStats' }
                }
              }
            }
          }
        },
        404: { description: 'Course not found' },
        403: { description: 'Not authorized' },
        500: { description: 'Server error' }
      }
    }
  }
}; 