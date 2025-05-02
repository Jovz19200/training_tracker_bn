module.exports = {
  type: 'object',
  required: ['firstName', 'lastName', 'email', 'password', 'role'],
  properties: {
    firstName: {
      type: 'string',
      description: 'User first name'
    },
    lastName: {
      type: 'string',
      description: 'User last name'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address'
    },
    password: {
      type: 'string',
      format: 'password',
      description: 'User password'
    },
    role: {
      type: 'string',
      enum: ['trainee', 'trainer', 'manager', 'admin'],
      description: 'User role'
    },
    phone: {
      type: 'string',
      description: 'User phone number'
    },
    hasDisability: {
      type: 'boolean',
      description: 'Whether user has a disability'
    },
    disabilityType: {
      type: 'string',
      enum: ['visual', 'hearing', 'physical', 'cognitive', 'other', 'none'],
      description: 'Type of disability'
    },
    accessibilityNeeds: {
      type: 'string',
      description: 'Specific accessibility requirements'
    }
  }
};