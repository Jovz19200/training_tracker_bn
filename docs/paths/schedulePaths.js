/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       required:
 *         - course
 *         - sessionNumber
 *         - title
 *         - startTime
 *         - endTime
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated schedule ID
 *         course:
 *           type: string
 *           description: Reference to Course model
 *         sessionNumber:
 *           type: number
 *           minimum: 1
 *           description: Sequential session number within the course
 *         title:
 *           type: string
 *           description: Session title
 *         description:
 *           type: string
 *           description: Detailed session description
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Session start time
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Session end time
 *         location:
 *           type: string
 *           description: Physical location for the session
 *         isVirtual:
 *           type: boolean
 *           default: false
 *           description: Whether this is a virtual session
 *         virtualMeetingLink:
 *           type: string
 *           description: Virtual meeting link (if isVirtual is true)
 *         trainer:
 *           type: string
 *           description: Reference to User model (trainer)
 *         resources:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of resource IDs assigned to this session
 *         materials:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of material URLs or descriptions
 *         status:
 *           type: string
 *           enum: [scheduled, in-progress, completed, cancelled, rescheduled]
 *           default: scheduled
 *           description: Current session status
 *         sessionQrCode:
 *           type: string
 *           description: QR code URL for attendance tracking
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     QRCodeResponse:
 *       type: object
 *       properties:
 *         qrCodeUrl:
 *           type: string
 *           description: Generated QR code URL
 *         sessionId:
 *           type: string
 *           description: Session ID
 *         sessionNumber:
 *           type: number
 *           description: Session number
 *         courseId:
 *           type: string
 *           description: Course ID
 */

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Get all schedules
 *     description: Retrieve all schedules with optional filtering
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in-progress, completed, cancelled, rescheduled]
 *         description: Filter by session status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of schedules retrieved successfully (calendar format)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date-time
 *                         description: Session start time
 *                       end:
 *                         type: string
 *                         format: date-time
 *                         description: Session end time
 *                       title:
 *                         type: string
 *                         description: Course title
 *                       instructor:
 *                         type: string
 *                         description: Trainer full name
 *                       sessionTitle:
 *                         type: string
 *                         description: Session title
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 * 
 *   post:
 *     summary: Create a new schedule
 *     description: Create a new session schedule. Only admins and trainers can create schedules.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course
 *               - sessionNumber
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               course:
 *                 type: string
 *                 description: Course ID
 *               sessionNumber:
 *                 type: number
 *                 minimum: 1
 *                 description: Sequential session number
 *               title:
 *                 type: string
 *                 description: Session title
 *               description:
 *                 type: string
 *                 description: Session description
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Session start time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: Session end time
 *               location:
 *                 type: string
 *                 description: Physical location
 *               isVirtual:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is a virtual session
 *               virtualMeetingLink:
 *                 type: string
 *                 description: Virtual meeting link
 *               trainer:
 *                 type: string
 *                 description: Trainer ID (defaults to current user)
 *               resources:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of resource IDs
 *               materials:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of material URLs
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "End time must be after start time"
 *                     - "Session number 1 already exists for this course"
 *                     - "Resource Training Room A is not available"
 *       404:
 *         description: Course or resource not found
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 * 
 * /api/schedules/{id}:
 *   get:
 *     summary: Get single schedule
 *     description: Retrieve a specific schedule by ID
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 * 
 *   put:
 *     summary: Update schedule
 *     description: Update a schedule. Cannot update completed sessions.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               isVirtual:
 *                 type: boolean
 *               virtualMeetingLink:
 *                 type: string
 *               trainer:
 *                 type: string
 *               resources:
 *                 type: array
 *                 items:
 *                   type: string
 *               materials:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Invalid input or cannot update completed session
 *       404:
 *         description: Schedule not found
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     summary: Delete schedule
 *     description: Delete a schedule. Cannot delete in-progress or completed sessions.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       400:
 *         description: Cannot delete in-progress or completed session
 *       404:
 *         description: Schedule not found
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 * 
 * /api/schedules/course/{courseId}:
 *   get:
 *     summary: Get schedules by course
 *     description: Retrieve all schedules for a specific course
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course schedules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 * 
 * /api/schedules/{id}/qrcode:
 *   get:
 *     summary: Generate QR code for session
 *     description: Generate a QR code for attendance tracking. Only admins and trainers can generate QR codes.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: QR code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/QRCodeResponse'
 *       404:
 *         description: Schedule not found
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 * 
 * /api/schedules/{id}/status:
 *   put:
 *     summary: Update session status
 *     description: Update the status of a session. Only admins and trainers can update statuses.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, in-progress, completed, cancelled, rescheduled]
 *                 description: New session status
 *     responses:
 *       200:
 *         description: Session status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Schedule not found
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */

module.exports = {
  '/api/schedules': {
    get: {
      summary: 'Get all schedules',
      description: 'Retrieve all schedules with optional filtering',
      tags: ['Schedules'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'courseId',
          schema: {
            type: 'string'
          },
          description: 'Filter by course ID'
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled']
          },
          description: 'Filter by session status'
        },
        {
          in: 'query',
          name: 'startDate',
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Filter by start date (YYYY-MM-DD)'
        },
        {
          in: 'query',
          name: 'endDate',
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Filter by end date (YYYY-MM-DD)'
        }
      ],
      responses: {
        200: {
          description: 'List of schedules retrieved successfully (calendar format)',
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
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        start: {
                          type: 'string',
                          format: 'date-time',
                          description: 'Session start time'
                        },
                        end: {
                          type: 'string',
                          format: 'date-time',
                          description: 'Session end time'
                        },
                        title: {
                          type: 'string',
                          description: 'Course title'
                        },
                        instructor: {
                          type: 'string',
                          description: 'Trainer full name'
                        },
                        sessionTitle: {
                          type: 'string',
                          description: 'Session title'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Not authorized'
        },
        500: {
          description: 'Server error'
        }
      }
    },
    post: {
      summary: 'Create a new schedule',
      description: 'Create a new session schedule. Only admins and trainers can create schedules.',
      tags: ['Schedules'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['course', 'sessionNumber', 'title', 'startTime', 'endTime'],
              properties: {
                course: {
                  type: 'string',
                  description: 'Course ID'
                },
                sessionNumber: {
                  type: 'number',
                  minimum: 1,
                  description: 'Sequential session number'
                },
                title: {
                  type: 'string',
                  description: 'Session title'
                },
                description: {
                  type: 'string',
                  description: 'Session description'
                },
                startTime: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Session start time'
                },
                endTime: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Session end time'
                },
                location: {
                  type: 'string',
                  description: 'Physical location'
                },
                isVirtual: {
                  type: 'boolean',
                  default: false,
                  description: 'Whether this is a virtual session'
                },
                virtualMeetingLink: {
                  type: 'string',
                  description: 'Virtual meeting link'
                },
                trainer: {
                  type: 'string',
                  description: 'Trainer ID (defaults to current user)'
                },
                resources: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Array of resource IDs'
                },
                materials: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Array of material URLs'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Schedule created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/Schedule'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid input',
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
                    examples: [
                      'End time must be after start time',
                      'Session number 1 already exists for this course',
                      'Resource Training Room A is not available'
                    ]
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Course or resource not found'
        },
        403: {
          description: 'Not authorized'
        },
        500: {
          description: 'Server error'
        }
      }
    }
  },
  '/api/schedules/{id}': {
    get: {
      summary: 'Get single schedule',
      description: 'Retrieve a specific schedule by ID',
      tags: ['Schedules'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Schedule ID'
        }
      ],
      responses: {
        200: {
          description: 'Schedule retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/Schedule'
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Schedule not found'
        },
        500: {
          description: 'Server error'
        }
      }
    },
    put: {
      summary: 'Update schedule',
      description: 'Update a schedule. Cannot update completed sessions.',
      tags: ['Schedules'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Schedule ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string'
                },
                description: {
                  type: 'string'
                },
                startTime: {
                  type: 'string',
                  format: 'date-time'
                },
                endTime: {
                  type: 'string',
                  format: 'date-time'
                },
                location: {
                  type: 'string'
                },
                isVirtual: {
                  type: 'boolean'
                },
                virtualMeetingLink: {
                  type: 'string'
                },
                trainer: {
                  type: 'string'
                },
                resources: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                materials: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Schedule updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/Schedule'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid input or cannot update completed session'
        },
        404: {
          description: 'Schedule not found'
        },
        403: {
          description: 'Not authorized'
        },
        500: {
          description: 'Server error'
        }
      }
    },
    delete: {
      summary: 'Delete schedule',
      description: 'Delete a schedule. Cannot delete in-progress or completed sessions.',
      tags: ['Schedules'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Schedule ID'
        }
      ],
      responses: {
        200: {
          description: 'Schedule deleted successfully'
        },
        400: {
          description: 'Cannot delete in-progress or completed session'
        },
        404: {
          description: 'Schedule not found'
        },
        403: {
          description: 'Not authorized'
        },
        500: {
          description: 'Server error'
        }
      }
    }
  },
  '/api/schedules/course/{courseId}': {
    get: {
      summary: 'Get schedules by course',
      description: 'Retrieve all schedules for a specific course',
      tags: ['Schedules'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Course ID'
        }
      ],
      responses: {
        200: {
          description: 'Course schedules retrieved successfully',
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
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Schedule'
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Course not found'
        },
        500: {
          description: 'Server error'
        }
      }
    }
  },
  '/api/schedules/{id}/qrcode': {
    get: {
      summary: 'Generate QR code for session',
      description: 'Generate a QR code for attendance tracking. Only admins and trainers can generate QR codes.',
      tags: ['Schedules'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Schedule ID'
        }
      ],
      responses: {
        200: {
          description: 'QR code generated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/QRCodeResponse'
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Schedule not found'
        },
        403: {
          description: 'Not authorized'
        },
        500: {
          description: 'Server error'
        }
      }
    }
  },
  '/api/schedules/{id}/status': {
    put: {
      summary: 'Update session status',
      description: 'Update the status of a session. Only admins and trainers can update statuses.',
      tags: ['Schedules'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Schedule ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: {
                  type: 'string',
                  enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled'],
                  description: 'New session status'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Session status updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  data: {
                    $ref: '#/components/schemas/Schedule'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid status'
        },
        404: {
          description: 'Schedule not found'
        },
        403: {
          description: 'Not authorized'
        },
        500: {
          description: 'Server error'
        }
      }
    }
  }
}; 