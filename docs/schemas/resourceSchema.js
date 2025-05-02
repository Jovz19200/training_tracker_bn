module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'Unique identifier for the resource'
    },
    title: {
      type: 'string',
      description: 'Title of the resource',
      maxLength: 100
    },
    description: {
      type: 'string',
      description: 'Description of the resource'
    },
    fileUrl: {
      type: 'string',
      description: 'URL to the resource file'
    },
    fileType: {
      type: 'string',
      enum: ['pdf', 'doc', 'ppt', 'video', 'audio', 'image', 'other'],
      description: 'Type of the resource file'
    },
    course: {
      type: 'string',
      description: 'Reference to the course this resource belongs to'
    },
    uploadDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the resource was uploaded'
    },
    size: {
      type: 'number',
      description: 'Size of the resource file in bytes'
    },
    isPublic: {
      type: 'boolean',
      default: false,
      description: 'Whether the resource is publicly accessible'
    }
  },
  required: ['title', 'fileUrl', 'fileType', 'course']
}; 