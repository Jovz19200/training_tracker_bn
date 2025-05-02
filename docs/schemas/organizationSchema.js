module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Unique identifier for the organization'
    },
    name: {
      type: 'string',
      description: 'Name of the organization',
      maxLength: 100
    },
    description: {
      type: 'string',
      description: 'Description of the organization'
    },
    address: {
      type: 'string',
      description: 'Physical address of the organization'
    },
    contactEmail: {
      type: 'string',
      format: 'email',
      description: 'Contact email of the organization'
    },
    contactPhone: {
      type: 'string',
      description: 'Contact phone number of the organization'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the organization was created'
    }
  },
  required: ['name', 'description', 'address', 'contactEmail', 'contactPhone']
}; 