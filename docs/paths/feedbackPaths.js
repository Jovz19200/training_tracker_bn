module.exports = {
  '/api/courses/{courseId}/feedback': {
    get: {
      tags: ['Feedback'],
      summary: 'Get all feedback for a course',
      description: 'Get all feedback for a specific course (public access)',
      parameters: [
        {
          name: 'courseId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID of the course'
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
                  success: {
                    type: 'boolean'
                  },
                  count: {
                    type: 'integer'
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Feedback'
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Course not found'
        }
      }
    },
    post: {
      tags: ['Feedback'],
      summary: 'Create new feedback',
      description: 'Create feedback for a specific course. Requires enrollment with status: completed, enrolled, failed, or dropped (if attended sessions). Admin/trainer can provide feedback without enrollment.',
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
                  description: 'Overall rating of the course (1-5)',
                  required: true
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
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/Feedback'
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      enrollmentStatus: {
                        type: 'string',
                        description: 'Status of user enrollment'
                      },
                      feedbackReason: {
                        type: 'string',
                        description: 'Reason why feedback was allowed'
                      },
                      userDisabilityType: {
                        type: 'string',
                        description: 'User disability type if applicable'
                      },
                      userAccessibilityNeeds: {
                        type: 'string',
                        description: 'User accessibility needs if applicable'
                      },
                      autoCompleted: {
                        type: 'boolean',
                        description: 'Whether enrollment was auto-completed'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid input or already submitted feedback',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'You have already submitted feedback for this course'
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
          description: 'Forbidden - Cannot provide feedback',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Cannot provide feedback: No enrollment record found'
                  },
                  details: {
                    type: 'object',
                    properties: {
                      enrollmentStatus: {
                        type: 'string'
                      },
                      courseEndDate: {
                        type: 'string',
                        format: 'date-time'
                      },
                      currentDate: {
                        type: 'string',
                        format: 'date-time'
                      },
                      reason: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
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
                  success: {
                    type: 'boolean'
                  },
                  count: {
                    type: 'integer'
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      next: {
                        type: 'object',
                        properties: {
                          page: {
                            type: 'integer'
                          },
                          limit: {
                            type: 'integer'
                          }
                        }
                      },
                      prev: {
                        type: 'object',
                        properties: {
                          page: {
                            type: 'integer'
                          },
                          limit: {
                            type: 'integer'
                          }
                        }
                      }
                    }
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Feedback'
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
          description: 'Forbidden - Admin access required'
        }
      }
    }
  },
  '/api/feedback/{id}': {
    get: {
      tags: ['Feedback'],
      summary: 'Get feedback by ID',
      description: 'Get feedback by ID (admin, feedback owner, or course instructor)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Feedback ID'
        }
      ],
      responses: {
        200: {
          description: 'Feedback details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/Feedback'
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
      description: 'Update feedback (feedback owner or admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Feedback ID'
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
                  description: 'Whether the feedback is anonymous'
                }
              }
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
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/Feedback'
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
          description: 'Unauthorized - Invalid or missing token'
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
      description: 'Delete feedback (feedback owner or admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Feedback ID'
        }
      ],
      responses: {
        200: {
          description: 'Feedback deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
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
          description: 'Unauthorized - Invalid or missing token'
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
  '/api/feedback/user/{userId}': {
    get: {
      tags: ['Feedback'],
      summary: 'Get feedback by user',
      description: 'Get all feedback submitted by a specific user (user can view own feedback, admin can view any)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'User ID'
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
          description: 'List of feedback by user',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  count: {
                    type: 'integer'
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      next: {
                        type: 'object',
                        properties: {
                          page: {
                            type: 'integer'
                          },
                          limit: {
                            type: 'integer'
                          }
                        }
                      },
                      prev: {
                        type: 'object',
                        properties: {
                          page: {
                            type: 'integer'
                          },
                          limit: {
                            type: 'integer'
                          }
                        }
                      }
                    }
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Feedback'
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
          description: 'Forbidden - Not authorized to view this user\'s feedback'
        },
        404: {
          description: 'User not found'
        }
      }
    }
  },
  '/api/feedback/course/{courseId}': {
    get: {
      tags: ['Feedback'],
      summary: 'Get feedback for a course',
      description: 'Get all feedback for a specific course (course instructor, admin, or enrolled users)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'courseId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Course ID'
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
                  success: {
                    type: 'boolean'
                  },
                  count: {
                    type: 'integer'
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      next: {
                        type: 'object',
                        properties: {
                          page: {
                            type: 'integer'
                          },
                          limit: {
                            type: 'integer'
                          }
                        }
                      },
                      prev: {
                        type: 'object',
                        properties: {
                          page: {
                            type: 'integer'
                          },
                          limit: {
                            type: 'integer'
                          }
                        }
                      }
                    }
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Feedback'
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
          description: 'Forbidden - Not authorized to view feedback for this course'
        },
        404: {
          description: 'Course not found'
        }
      }
    }
  }
}; 