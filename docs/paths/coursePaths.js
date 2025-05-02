module.exports = {
  '/api/courses': {
    get: {
      tags: ['Courses'],
      summary: 'Get all courses',
      parameters: [
        {
          in: 'query',
          name: 'select',
          schema: {
            type: 'string'
          },
          description: 'Fields to select'
        },
        {
          in: 'query',
          name: 'sort',
          schema: {
            type: 'string'
          },
          description: 'Sort criteria'
        },
        {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer'
          },
          description: 'Page number'
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer'
          },
          description: 'Results per page'
        }
      ],
      responses: {
        200: {
          description: 'List of courses retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  count: {
                    type: 'number'
                  },
                  pagination: {
                    type: 'object'
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Course'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Courses'],
      summary: 'Create new course',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Course'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Course created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/Course'
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