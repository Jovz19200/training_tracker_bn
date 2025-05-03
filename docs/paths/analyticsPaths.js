module.exports = {
  '/api/analytics/dashboard': {
    get: {
      tags: ['Analytics'],
      summary: 'Get dashboard analytics',
      description: 'Retrieves overall dashboard analytics and metrics',
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
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      totalUsers: { type: 'number' },
                      totalCourses: { type: 'number' },
                      activeEnrollments: { type: 'number' },
                      completionRate: { type: 'number' }
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
          description: 'Forbidden - User does not have required role'
        }
      }
    }
  },
  '/api/analytics/attendance': {
    get: {
      tags: ['Analytics'],
      summary: 'Get attendance analytics',
      description: 'Retrieves attendance statistics and trends',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Attendance analytics retrieved successfully',
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
                      attendanceRate: { type: 'number' },
                      averageAttendance: { type: 'number' },
                      trends: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            date: { type: 'string' },
                            attendance: { type: 'number' }
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
          description: 'Forbidden - User does not have required role'
        }
      }
    }
  },
  '/api/analytics/completion-rates': {
    get: {
      tags: ['Analytics'],
      summary: 'Get completion rates analytics',
      description: 'Retrieves course completion rates and statistics',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Completion rates analytics retrieved successfully',
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
                      overallCompletionRate: { type: 'number' },
                      courseCompletionRates: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            courseId: { type: 'string' },
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
          description: 'Forbidden - User does not have required role'
        }
      }
    }
  },
  '/api/analytics/training-costs': {
    get: {
      tags: ['Analytics'],
      summary: 'Get training costs analytics',
      description: 'Retrieves training cost analysis and budget utilization',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Training costs analytics retrieved successfully',
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
                      totalBudget: { type: 'number' },
                      utilizedBudget: { type: 'number' },
                      costPerTrainee: { type: 'number' },
                      costBreakdown: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            category: { type: 'string' },
                            amount: { type: 'number' }
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
          description: 'Forbidden - User does not have required role'
        }
      }
    }
  },
  '/api/analytics/skills-gap': {
    get: {
      tags: ['Analytics'],
      summary: 'Get skills gap analytics',
      description: 'Retrieves analysis of skills gaps and training needs',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Skills gap analytics retrieved successfully',
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
                      skillsGapAnalysis: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            skill: { type: 'string' },
                            currentLevel: { type: 'number' },
                            targetLevel: { type: 'number' },
                            gap: { type: 'number' }
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
          description: 'Forbidden - User does not have required role'
        }
      }
    }
  },
  '/api/analytics/reports/generate': {
    get: {
      tags: ['Analytics'],
      summary: 'Generate custom report',
      description: 'Generates a custom analytics report based on specified parameters',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'reportType',
          in: 'query',
          description: 'Type of report to generate',
          required: true,
          schema: {
            type: 'string',
            enum: ['attendance', 'completion', 'cost', 'skills']
          }
        },
        {
          name: 'startDate',
          in: 'query',
          description: 'Start date for report period',
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        {
          name: 'endDate',
          in: 'query',
          description: 'End date for report period',
          schema: {
            type: 'string',
            format: 'date'
          }
        }
      ],
      responses: {
        200: {
          description: 'Report generated successfully',
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
                      reportId: { type: 'string' },
                      downloadUrl: { type: 'string' }
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
          description: 'Forbidden - User does not have required role'
        }
      }
    }
  }
}; 