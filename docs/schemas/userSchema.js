module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Unique identifier for the user'
    },
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
    role: {
      type: 'string',
      enum: ['trainee', 'trainer', 'manager', 'admin'],
      default: 'trainee',
      description: 'User\'s role in the system'
    },
    password: {
      type: 'string',
      format: 'password',
      minLength: 6,
      description: 'User\'s password (hashed)'
    },
    phone: {
      type: 'string',
      maxLength: 20,
      description: 'User\'s phone number'
    },
    organization: {
      type: 'string',
      description: 'ID of the organization the user belongs to. Must be a valid organization ID from the database.',
      example: '507f1f77bcf86cd799439011'
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
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp when the user was created'
    }
  },
  required: ['firstName', 'lastName', 'email', 'password', 'organization'],
  example: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    organization: '507f1f77bcf86cd799439011',
    role: 'trainee',
    phone: '+1234567890',
    hasDisability: false,
    disabilityType: 'none'
  }
};