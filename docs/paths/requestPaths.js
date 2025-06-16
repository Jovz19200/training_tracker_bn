module.exports = {
  '/api/requests': {
    get: {
      tags: ['Training Requests'],
      summary: 'Get all training requests',
      description: 'Retrieve all training requests (admin only)',
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
          description: 'Filter by request status',
          schema: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected', 'cancelled']
          }
        }
      ],
      responses: {
        200: {
          description: 'List of training requests',
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
                      $ref: '#/components/schemas/TrainingRequest'
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Not authenticated'
        },
        403: {
          description: 'Not authorized'
        }
      }
    },
    post: {
      tags: ['Training Requests'],
      summary: 'Create training request',
      description: 'Create a new training request (trainee/trainer only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                course: {
                  type: 'string',
                  description: 'Course ID'
                },
                justification: {
                  type: 'string',
                  description: 'Reason for requesting the training'
                },
                accessibilityRequirements: {
                  type: 'string',
                  description: 'Any special accessibility requirements'
                }
              },
              required: ['course', 'justification']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Training request created successfully',
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
                    $ref: '#/components/schemas/TrainingRequest'
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
          description: 'Not authenticated'
        },
        403: {
          description: 'Not authorized'
        }
      }
    }
  },
  '/api/requests/{id}': {
    get: {
      tags: ['Training Requests'],
      summary: 'Get training request by ID',
      description: 'Get details of a specific training request',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Training request ID'
        }
      ],
      responses: {
        200: {
          description: 'Training request details',
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
                    $ref: '#/components/schemas/TrainingRequest'
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Training request not found'
        }
      }
    },
    put: {
      tags: ['Training Requests'],
      summary: 'Update training request',
      description: 'Update a training request (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Training request ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                justification: {
                  type: 'string',
                  description: 'Updated reason for requesting the training'
                },
                accessibilityRequirements: {
                  type: 'string',
                  description: 'Updated accessibility requirements'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Training request updated successfully',
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
                    $ref: '#/components/schemas/TrainingRequest'
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
          description: 'Not authenticated'
        },
        403: {
          description: 'Not authorized'
        },
        404: {
          description: 'Training request not found'
        }
      }
    },
    delete: {
      tags: ['Training Requests'],
      summary: 'Delete training request',
      description: 'Delete a training request (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Training request ID'
        }
      ],
      responses: {
        200: {
          description: 'Training request deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {}
                }
              }
            }
          }
        },
        401: {
          description: 'Not authenticated'
        },
        403: {
          description: 'Not authorized'
        },
        404: {
          description: 'Training request not found'
        }
      }
    }
  },
  '/api/requests/{id}/approve': {
    put: {
      tags: ['Training Requests'],
      summary: 'Approve training request',
      description: 'Approve a training request (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Training request ID'
        }
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                approvalNotes: {
                  type: 'string',
                  description: 'Notes about the approval'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Training request approved successfully',
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
                    $ref: '#/components/schemas/TrainingRequest'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request or request already processed'
        },
        401: {
          description: 'Not authenticated'
        },
        403: {
          description: 'Not authorized'
        },
        404: {
          description: 'Training request not found'
        }
      }
    }
  },
  '/api/requests/{id}/reject': {
    put: {
      tags: ['Training Requests'],
      summary: 'Reject training request',
      description: 'Reject a training request (admin only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Training request ID'
        }
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                approvalNotes: {
                  type: 'string',
                  description: 'Notes about the rejection'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Training request rejected successfully',
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
                    $ref: '#/components/schemas/TrainingRequest'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request or request already processed'
        },
        401: {
          description: 'Not authenticated'
        },
        403: {
          description: 'Not authorized'
        },
        404: {
          description: 'Training request not found'
        }
      }
    }
  }
}; 