module.exports = {
  '/api/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: 'Register a new user account. All new users are created with the trainee role by default. Organization must be valid.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['firstName', 'lastName', 'email', 'password', 'organization'],
              properties: {
                firstName: {
                  type: 'string',
                  description: 'User\'s first name',
                  maxLength: 50
                },
                lastName: {
                  type: 'string',
                  description: 'User\'s last name',
                  maxLength: 50
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User\'s email address'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  minLength: 6,
                  description: 'User\'s password'
                },
                organization: {
                  type: 'string',
                  description: 'ID of the organization the user belongs to. Must be a valid organization ID from the database.',
                  example: '507f1f77bcf86cd799439011'
                },
                phone: {
                  type: 'string',
                  maxLength: 20,
                  description: 'User\'s phone number'
                },
                hasDisability: {
                  type: 'boolean',
                  default: false,
                  description: 'Whether the user has a disability'
                },
                disabilityType: {
                  type: 'string',
                  enum: ['visual', 'hearing', 'physical', 'cognitive', 'other', 'none'],
                  default: 'none',
                  description: 'Type of disability if any'
                },
                accessibilityNeeds: {
                  type: 'string',
                  description: 'Specific accessibility requirements'
                }
              }
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
                  success: { type: 'boolean' },
                  token: { type: 'string' },
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
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' }
                },
                example: {
                  success: false,
                  message: 'Organization not found with id of 507f1f77bcf86cd799439011'
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email'
                },
                password: {
                  type: 'string',
                  format: 'password'
                }
              }
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
                    type: 'boolean'
                  },
                  token: {
                    type: 'string'
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
  }
};