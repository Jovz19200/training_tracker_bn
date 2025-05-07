module.exports = {
  '/api/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: 'Create a new user account',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                firstName: {
                  type: 'string',
                  description: 'User\'s first name'
                },
                lastName: {
                  type: 'string',
                  description: 'User\'s last name'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User\'s email address'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  description: 'User\'s password (min 6 characters)'
                },
                role: {
                  type: 'string',
                  enum: ['user', 'instructor', 'admin'],
                  default: 'user',
                  description: 'User\'s role'
                }
              },
              required: ['firstName', 'lastName', 'email', 'password']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully and logged in',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  token: {
                    type: 'string',
                    description: 'JWT token'
                  },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid input'
        },
        409: {
          description: 'Email already exists'
        }
      }
    }
  },
  '/api/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login user',
      description: 'Authenticate user and get token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User\'s email address'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  description: 'User\'s password'
                }
              },
              required: ['email', 'password']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  token: {
                    type: 'string',
                    description: 'JWT token'
                  },
                  user: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Invalid credentials'
        }
      }
    }
  },
  '/api/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get current user',
      description: 'Get the currently authenticated user\'s profile',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User profile retrieved successfully',
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
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Not authenticated'
        }
      }
    }
  },
  '/api/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user',
      description: 'Logout the currently authenticated user',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Logged out successfully'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Not authenticated'
        }
      }
    }
  },
  '/api/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Forgot password',
      description: 'Request password reset email',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User\'s email address'
                }
              },
              required: ['email']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Password reset email sent',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Password reset email sent'
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'User not found'
        }
      }
    }
  },
  '/api/auth/reset-password/{resetToken}': {
    put: {
      tags: ['Auth'],
      summary: 'Reset password',
      description: 'Reset password using token from email',
      parameters: [
        {
          name: 'resetToken',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Password reset token from email'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                password: {
                  type: 'string',
                  format: 'password',
                  description: 'New password (min 6 characters)'
                }
              },
              required: ['password']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Password reset successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Password reset successful'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid or expired token'
        }
      }
    }
  }
};