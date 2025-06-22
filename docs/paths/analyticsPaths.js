module.exports = {
  '/api/analytics/dashboard': {
    get: {
      tags: ['Analytics'],
      summary: 'Get dashboard analytics',
      description: 'Retrieves comprehensive dashboard metrics including overview, recent activity, ratings, and upcoming courses',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Dashboard analytics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      overview: {
                        type: 'object',
                        properties: {
                          totalUsers: { type: 'number' },
                          totalCourses: { type: 'number' },
                          activeEnrollments: { type: 'number' },
                          completionRate: { type: 'number' }
                        }
                      },
                      recentActivity: {
                        type: 'object',
                        properties: {
                          newUsersThisMonth: { type: 'number' },
                          newCoursesThisMonth: { type: 'number' },
                          newEnrollmentsThisMonth: { type: 'number' }
                        }
                      },
                      ratings: {
                        type: 'object',
                        properties: {
                          overall: { type: 'number' },
                          content: { type: 'number' },
                          instructor: { type: 'number' },
                          totalFeedback: { type: 'number' }
                        }
                      },
                      recentFeedback: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            overallRating: { type: 'number' },
                            user: {
                              type: 'object',
                              properties: {
                                firstName: { type: 'string' },
                                lastName: { type: 'string' }
                              }
                            },
                            course: {
                              type: 'object',
                              properties: {
                                title: { type: 'string' }
                              }
                            }
                          }
                        }
                      },
                      upcomingCourses: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            title: { type: 'string' },
                            startDate: { type: 'string', format: 'date-time' },
                            instructor: {
                              type: 'object',
                              properties: {
                                firstName: { type: 'string' },
                                lastName: { type: 'string' }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/enrollment-trends': {
    get: {
      tags: ['Analytics'],
      summary: 'Get enrollment trends',
      description: 'Retrieves enrollment trends over time with filtering options',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'period',
          in: 'query',
          description: 'Time period for grouping data',
          schema: {
            type: 'string',
            enum: ['monthly', 'weekly'],
            default: 'monthly'
          }
        },
        {
          name: 'startDate',
          in: 'query',
          description: 'Start date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'End date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'courseId',
          in: 'query',
          description: 'Filter by specific course',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'organizationId',
          in: 'query',
          description: 'Filter by specific organization',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Enrollment trends retrieved successfully',
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
                        period: { type: 'string' },
                        enrollments: { type: 'number' },
                        completed: { type: 'number' },
                        dropped: { type: 'number' },
                        completionRate: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/feedback-trends': {
    get: {
      tags: ['Analytics'],
      summary: 'Get feedback trends and analysis',
      description: 'Retrieves feedback trends, rating distributions, and top performing courses',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'startDate',
          in: 'query',
          description: 'Start date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'End date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'courseId',
          in: 'query',
          description: 'Filter by specific course',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'instructorId',
          in: 'query',
          description: 'Filter by specific instructor',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Feedback trends retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      monthlyTrends: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            period: { type: 'string' },
                            feedbackCount: { type: 'number' },
                            avgOverallRating: { type: 'number' },
                            avgContentRating: { type: 'number' },
                            avgInstructorRating: { type: 'number' }
                          }
                        }
                      },
                      ratingDistribution: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'number' },
                            count: { type: 'number' }
                          }
                        }
                      },
                      topCourses: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            courseId: { type: 'string' },
                            courseTitle: { type: 'string' },
                            avgRating: { type: 'number' },
                            totalFeedback: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/completion-rates': {
    get: {
      tags: ['Analytics'],
      summary: 'Get completion rate analysis',
      description: 'Retrieves detailed completion rate analysis by course and organization',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'startDate',
          in: 'query',
          description: 'Start date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'End date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'courseId',
          in: 'query',
          description: 'Filter by specific course',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'organizationId',
          in: 'query',
          description: 'Filter by specific organization',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Completion rates retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      overall: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          completed: { type: 'number' },
                          dropped: { type: 'number' },
                          inProgress: { type: 'number' },
                          completionRate: { type: 'number' }
                        }
                      },
                      byCourse: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            courseId: { type: 'string' },
                            courseTitle: { type: 'string' },
                            total: { type: 'number' },
                            completed: { type: 'number' },
                            dropped: { type: 'number' },
                            completionRate: { type: 'number' }
                          }
                        }
                      },
                      byOrganization: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            organizationId: { type: 'string' },
                            organizationName: { type: 'string' },
                            total: { type: 'number' },
                            completed: { type: 'number' },
                            dropped: { type: 'number' },
                            completionRate: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/user-growth': {
    get: {
      tags: ['Analytics'],
      summary: 'Get user growth trends',
      description: 'Retrieves user growth trends over time with cumulative growth calculation',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'period',
          in: 'query',
          description: 'Time period for grouping data',
          schema: {
            type: 'string',
            enum: ['monthly', 'weekly'],
            default: 'monthly'
          }
        },
        {
          name: 'startDate',
          in: 'query',
          description: 'Start date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'End date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'organizationId',
          in: 'query',
          description: 'Filter by specific organization',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'User growth trends retrieved successfully',
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
                        period: { type: 'string' },
                        newUsers: { type: 'number' },
                        activeUsers: { type: 'number' },
                        cumulativeUsers: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/course-performance': {
    get: {
      tags: ['Analytics'],
      summary: 'Get course performance analysis',
      description: 'Retrieves detailed course performance metrics including completion rates and ratings',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'startDate',
          in: 'query',
          description: 'Start date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'End date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'organizationId',
          in: 'query',
          description: 'Filter by specific organization',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Course performance retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      coursePerformance: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            courseId: { type: 'string' },
                            title: { type: 'string' },
                            totalEnrollments: { type: 'number' },
                            completedEnrollments: { type: 'number' },
                            averageRating: { type: 'number' },
                            feedbackCount: { type: 'number' },
                            completionRate: { type: 'number' }
                          }
                        }
                      },
                      topCourses: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            courseId: { type: 'string' },
                            courseTitle: { type: 'string' },
                            avgRating: { type: 'number' },
                            totalFeedback: { type: 'number' }
                          }
                        }
                      },
                      coursesNeedingAttention: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            courseId: { type: 'string' },
                            title: { type: 'string' },
                            completionRate: { type: 'number' },
                            averageRating: { type: 'number' }
                          }
                        }
                      },
                      summary: {
                        type: 'object',
                        properties: {
                          totalCourses: { type: 'number' },
                          averageCompletionRate: { type: 'number' },
                          averageRating: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/organization/{organizationId}': {
    get: {
      tags: ['Analytics'],
      summary: 'Get organization analytics',
      description: 'Retrieves comprehensive analytics for a specific organization',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'organizationId',
          in: 'path',
          required: true,
          description: 'Organization ID',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'startDate',
          in: 'query',
          description: 'Start date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'End date for filtering (ISO format)',
          schema: {
            type: 'string',
            format: 'date'
          }
        }
      ],
      responses: {
        200: {
          description: 'Organization analytics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      organization: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          description: { type: 'string' }
                        }
                      },
                      overview: {
                        type: 'object',
                        properties: {
                          users: {
                            type: 'object',
                            properties: {
                              totalUsers: { type: 'number' },
                              activeUsers: { type: 'number' }
                            }
                          },
                          enrollments: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                _id: { type: 'string' },
                                count: { type: 'number' }
                              }
                            }
                          },
                          courses: {
                            type: 'object',
                            properties: {
                              totalCourses: { type: 'number' },
                              activeCourses: { type: 'number' }
                            }
                          },
                          feedback: {
                            type: 'object',
                            properties: {
                              totalFeedback: { type: 'number' },
                              averageRating: { type: 'number' }
                            }
                          }
                        }
                      },
                      trends: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            period: { type: 'string' },
                            enrollments: { type: 'number' },
                            completions: { type: 'number' },
                            completionRate: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        },
        404: {
          description: 'Organization not found'
        }
      }
    }
  },
  '/api/analytics/realtime': {
    get: {
      tags: ['Analytics'],
      summary: 'Get real-time analytics',
      description: 'Retrieves real-time activity metrics including today, this week, and this month',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Real-time analytics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      today: {
                        type: 'object',
                        properties: {
                          enrollments: { type: 'number' },
                          completions: { type: 'number' },
                          feedback: { type: 'number' }
                        }
                      },
                      thisWeek: {
                        type: 'object',
                        properties: {
                          enrollments: { type: 'number' },
                          completions: { type: 'number' }
                        }
                      },
                      thisMonth: {
                        type: 'object',
                        properties: {
                          enrollments: { type: 'number' },
                          completions: { type: 'number' }
                        }
                      },
                      realtime: {
                        type: 'object',
                        properties: {
                          activeUsers: { type: 'number' },
                          ongoingCourses: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/export': {
    post: {
      tags: ['Analytics'],
      summary: 'Export analytics data',
      description: 'Exports analytics data in various formats (CSV, Excel, JSON)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['dataType'],
              properties: {
                dataType: {
                  type: 'string',
                  enum: ['dashboard', 'enrollment-trends', 'feedback-trends', 'completion-rates', 'course-performance', 'comprehensive'],
                  description: 'Type of data to export'
                },
                format: {
                  type: 'string',
                  enum: ['csv', 'excel', 'json'],
                  default: 'excel',
                  description: 'Export format'
                },
                startDate: {
                  type: 'string',
                  format: 'date',
                  description: 'Start date for filtering'
                },
                endDate: {
                  type: 'string',
                  format: 'date',
                  description: 'End date for filtering'
                },
                courseId: {
                  type: 'string',
                  description: 'Filter by specific course'
                },
                organizationId: {
                  type: 'string',
                  description: 'Filter by specific organization'
                },
                includeCharts: {
                  type: 'boolean',
                  default: false,
                  description: 'Include charts in export (Excel only)'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Export completed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      exportId: { type: 'string' },
                      filename: { type: 'string' },
                      downloadUrl: { type: 'string' },
                      format: { type: 'string' },
                      dataType: { type: 'string' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request parameters'
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/download/{filename}': {
    get: {
      tags: ['Analytics'],
      summary: 'Download exported file',
      description: 'Downloads an exported analytics file',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'filename',
          in: 'path',
          required: true,
          description: 'Name of the file to download',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'File downloaded successfully',
          content: {
            'application/octet-stream': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        },
        404: {
          description: 'Export file not found'
        }
      }
    }
  },
  '/api/analytics/exports': {
    get: {
      tags: ['Analytics'],
      summary: 'Get export history',
      description: 'Retrieves list of all exported files with metadata',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Export history retrieved successfully',
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
                        filename: { type: 'string' },
                        size: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' },
                        modifiedAt: { type: 'string', format: 'date-time' },
                        downloadUrl: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/reports/generate': {
    post: {
      tags: ['Analytics'],
      summary: 'Generate custom report',
      description: 'Generates a custom analytics report based on specified parameters',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['reportType'],
              properties: {
                reportType: {
                  type: 'string',
                  enum: ['enrollment', 'completion', 'feedback', 'comprehensive'],
                  description: 'Type of report to generate'
                },
                startDate: {
                  type: 'string',
                  format: 'date',
                  description: 'Start date for report period'
                },
                endDate: {
                  type: 'string',
                  format: 'date',
                  description: 'End date for report period'
                },
                courseId: {
                  type: 'string',
                  description: 'Filter by specific course'
                },
                organizationId: {
                  type: 'string',
                  description: 'Filter by specific organization'
                },
                format: {
                  type: 'string',
                  enum: ['pdf', 'json'],
                  default: 'pdf',
                  description: 'Report format'
                },
                includeCharts: {
                  type: 'boolean',
                  default: true,
                  description: 'Include charts in report'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Report generated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      reportId: { type: 'string' },
                      downloadUrl: { type: 'string' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid report type or parameters'
        },
        401: {
          description: 'Unauthorized - Invalid or missing token'
        },
        403: {
          description: 'Forbidden - User does not have required role (admin, trainer)'
        }
      }
    }
  },
  '/api/analytics/disability-type-stats': {
    get: {
      tags: ['Analytics'],
      summary: 'Get user counts by disability type',
      description: 'Returns the number of users for each disability type',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Disability type stats',
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
                        _id: { type: 'string' },
                        count: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/analytics/accessibility-needs-stats': {
    get: {
      tags: ['Analytics'],
      summary: 'Get user counts by accessibility needs',
      description: 'Returns the number of users for each accessibility need',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Accessibility needs stats',
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
                        _id: { type: 'string' },
                        count: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/analytics/enrollment-stats-by-disability': {
    get: {
      tags: ['Analytics'],
      summary: 'Get enrollment and completion counts by disability type',
      description: 'Returns the number of enrollments and completions for each disability type',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Enrollment stats by disability',
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
                        _id: { type: 'string' },
                        enrollments: { type: 'integer' },
                        completions: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}; 