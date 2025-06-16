module.exports = {
  '/api/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: 'Registers a new user with the system. An email verification link will be sent to the provided email address.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully. Email verification required.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User registered successfully. Please verify your email.' }
                }
              }
            }
          }
        },
        400: {
          description: 'Bad request (e.g., missing fields, invalid organization, email already exists)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Email already exists' }
                }
              }
            }
          }
        },
        500: {
          description: 'Server error (e.g., email sending failed)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Email verification could not be sent. Please try again later.' }
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
      tags: ['Auth'],
      summary: 'Login user',
      description: 'Authenticate user and get JWT token or prompt for 2FA/email verification.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: { type: 'string', format: 'password', example: 'password123' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'User logged in successfully or 2FA required',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5c...' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  },
                  {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: '2FA token sent to your email' },
                      twoFARequired: { type: 'boolean', example: true },
                      userId: { type: 'string', example: '507f1f77bcf86cd799439011' }
                    }
                  }
                ]
              }
            }
          }
        },
        401: {
          description: 'Invalid credentials or email not verified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid credentials' }
                },
                examples: {
                  invalidCredentials: {
                    value: { success: false, message: 'Invalid credentials' }
                  },
                  emailNotVerified: {
                    value: { success: false, message: 'Please verify your email address to log in.' }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Server Error' }
                }
              }
            }
          }
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
    get: {
      tags: ['Auth'],
      summary: 'Logout user',
      description: 'Clear JWT cookie and log user out',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User logged out successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { type: 'object', example: {} }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/verify2fa': {
    post: {
      tags: ['Auth'],
      summary: 'Verify Two-Factor Authentication (2FA) token',
      description: 'Verifies the 2FA token sent to the user\'s email and issues a JWT if successful.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'twoFAToken'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                twoFAToken: { type: 'string', example: '123456' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: '2FA token verified, user logged in',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5c...' },
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid email or 2FA token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid or expired 2FA token' }
                }
              }
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Server Error' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/forgotpassword': {
    post: {
      tags: ['Auth'],
      summary: 'Request password reset',
      description: 'Sends a password reset link to the user\'s email.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Password reset email sent successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { type: 'string', example: 'Email sent' }
                }
              }
            }
          }
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'There is no user with that email' }
                }
              }
            }
          }
        },
        500: {
          description: 'Email could not be sent or server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Email could not be sent' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/resetpassword/{resettoken}': {
    put: {
      tags: ['Auth'],
      summary: 'Reset password',
      description: 'Resets the user\'s password using a valid reset token.',
      parameters: [
        {
          name: 'resettoken',
          in: 'path',
          required: true,
          description: 'The password reset token received via email',
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['password'],
              properties: {
                password: { type: 'string', minLength: 6, example: 'newsecurepassword123' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Password reset successfully, user logged in',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5c...' },
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid or expired token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid token' }
                }
              }
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Server Error' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/google': {
    get: {
      tags: ['Auth'],
      summary: 'Google OAuth Login',
      description: 'Redirects to Google OAuth consent screen for authentication',
      responses: {
        302: {
          description: 'Redirect to Google OAuth consent screen',
          headers: {
            Location: {
              schema: {
                type: 'string',
                example: 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=...'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/google/callback': {
    get: {
      tags: ['Auth'],
      summary: 'Google OAuth Callback',
      description: 'Handles the callback from Google OAuth after successful authentication',
      parameters: [
        {
          name: 'code',
          in: 'query',
          description: 'Authorization code from Google',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        302: {
          description: 'Redirect to frontend with JWT token',
          headers: {
            Location: {
              schema: {
                type: 'string',
                example: 'http://localhost:3000/auth-success?token=eyJhbGciOiJIUzI1NiIs...'
              }
            }
          }
        },
        401: {
          description: 'Authentication failed',
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
                    example: 'Authentication failed'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/verifyemail/{verificationtoken}': {
    get: {
      tags: ['Auth'],
      summary: 'Verify user email',
      description: 'Verifies the user\'s email address using a verification token received via email. Issues a JWT upon successful verification.',
      parameters: [
        {
          name: 'verificationtoken',
          in: 'path',
          required: true,
          description: 'The email verification token received via email',
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: 'Email verified successfully, user logged in',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5c...' },
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid or expired verification token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid or expired verification token' }
                }
              }
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Server Error' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/enable2fa': {
    post: {
      tags: ['Auth'],
      summary: 'Enable Two-Factor Authentication (2FA) for a user',
      description: 'Admin only: Directly enables 2FA for a user and sends an informational email. Can be used for any user or the admin themselves.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { 
                  type: 'string', 
                  example: '507f1f77bcf86cd799439011',
                  description: 'ID of the user to enable 2FA for. If not provided, enables 2FA for the admin.'
                }
              },
              required: ['email', 'password']
            }
          }
        }
      },
      responses: {
        200: {
          description: '2FA enabled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: '2FA has been enabled for the account. An email notification has been sent.' }
                }
              }
            }
          }
        },
        400: {
          description: '2FA already enabled',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: '2FA is already enabled for this account' }
                }
              }
            }
          }
        },
        401: {
          description: 'Not authorized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Not authorized to access this route' }
                }
              }
            }
          }
        },
        403: {
          description: 'Not an admin',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Only administrators can manage 2FA settings' }
                }
              }
            }
          }
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'User not found' }
                }
              }
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Email could not be sent. Please try again later.' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/disable2fa': {
    post: {
      tags: ['Auth'],
      summary: 'Disable Two-Factor Authentication (2FA) for a user',
      description: 'Admin only: Directly disables 2FA for a user and sends an informational email. Can be used for any user or the admin themselves.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { 
                  type: 'string', 
                  example: '507f1f77bcf86cd799439011',
                  description: 'ID of the user to disable 2FA for. If not provided, disables 2FA for the admin.'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: '2FA disabled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: '2FA has been disabled for the account. An email notification has been sent.' }
                }
              }
            }
          }
        },
        400: {
          description: '2FA already disabled',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: '2FA is already disabled for this account' }
                }
              }
            }
          }
        },
        401: {
          description: 'Not authorized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Not authorized to access this route' }
                }
              }
            }
          }
        },
        403: {
          description: 'Not an admin',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Only administrators can manage 2FA settings' }
                }
              }
            }
          }
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'User not found' }
                }
              }
            }
          }
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
  },
  '/api/auth/google': {
    get: {
      tags: ['Auth'],
      summary: 'Google OAuth Login',
      description: 'Redirects to Google OAuth consent screen for authentication',
      responses: {
        302: {
          description: 'Redirect to Google OAuth consent screen',
          headers: {
            Location: {
              schema: {
                type: 'string',
                example: 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=...'
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/google/callback': {
    get: {
      tags: ['Auth'],
      summary: 'Google OAuth Callback',
      description: 'Handles the callback from Google OAuth after successful authentication',
      parameters: [
        {
          name: 'code',
          in: 'query',
          description: 'Authorization code from Google',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        302: {
          description: 'Redirect to frontend with JWT token',
          headers: {
            Location: {
              schema: {
                type: 'string',
                example: 'http://localhost:3000/auth-success?token=eyJhbGciOiJIUzI1NiIs...'
              }
            }
          }
        },
        401: {
          description: 'Authentication failed',
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
                    example: 'Authentication failed'
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