const express = require('express');
const swaggerUi = require('swagger-ui-express');
const userSchema = require('./schemas/userSchema');
const courseSchema = require('./schemas/courseSchema');
const organizationSchema = require('./schemas/organizationSchema');
const enrollmentSchema = require('./schemas/enrollmentSchema');
const certificateSchema = require('./schemas/certificateSchema');
const feedbackSchema = require('./schemas/feedbackSchema');
const resourceSchema = require('./schemas/resourceSchema');
const attendanceSchema = require('./schemas/attendanceSchema');
const scheduleSchema = require('./schemas/scheduleSchema');

const authPaths = require('./paths/authPaths');
const userPaths = require('./paths/userPaths');
const coursePaths = require('./paths/coursePaths');
const organizationPaths = require('./paths/organizationPaths');
const enrollmentPaths = require('./paths/enrollmentPaths');
const feedbackPaths = require('./paths/feedbackPaths');
const resourcePaths = require('./paths/resourcePaths');
const attendancePaths = require('./paths/attendancePaths');
const schedulePaths = require('./paths/schedulePaths');
const analyticsPaths = require('./paths/analyticsPaths');

const router = express.Router();

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'OTMS API Documentation',
    version: '1.0.0',
    description: 'API documentation for Organization Training Management System (OTMS)',
    contact: {
      name: 'OTMS Support',
      email: 'support@otms.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://otms-bn.onrender.com/',
      description: 'Production server'
    }
  ],
  components: {
    schemas: {
      User: userSchema,
      Course: courseSchema,
      Organization: organizationSchema,
      Enrollment: enrollmentSchema.Enrollment,
      EnrollmentStats: enrollmentSchema.EnrollmentStats,
      AutoUpdateResult: enrollmentSchema.AutoUpdateResult,
      Certificate: certificateSchema,
      Feedback: feedbackSchema,
      Resource: resourceSchema,
      Attendance: attendanceSchema,
      Schedule: scheduleSchema.Schedule,
      QRCodeResponse: scheduleSchema.QRCodeResponse
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    ...authPaths,
    ...userPaths,
    ...coursePaths,
    ...organizationPaths,
    ...enrollmentPaths,
    ...feedbackPaths,
    ...resourcePaths,
    ...attendancePaths,
    ...schedulePaths,
    ...analyticsPaths
  }
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

module.exports = router;