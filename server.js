const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const passport = require('passport');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const scheduleRoutes = require('./routes/schedules');
const resourceRoutes = require('./routes/resources');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const certificateRoutes = require('./routes/certificates');
const courseFeedbackRoutes = require('./routes/courseFeedback');
const feedbackRoutes = require('./routes/feedback');
const organizationRoutes = require('./routes/organizations');
const swaggerRouter = require('./docs/swagger');

// Import scheduler
const { initializeScheduler } = require('./utils/scheduler');

require('dotenv').config();

// Load passport config
require('./config/passport');

const app = express();

// Connect to database
connectDB();

// Initialize scheduled tasks
initializeScheduler();

// Middleware
app.use(cors({
  origin: [process.env.HOSTED_OTMS_FN_URL, process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerRouter);

// Initialize passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses', courseFeedbackRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/organizations', organizationRoutes);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;