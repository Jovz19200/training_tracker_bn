const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardMetrics,
  getEnrollmentTrends,
  getFeedbackTrends,
  getCompletionRates,
  getUserGrowthTrends,
  getCoursePerformance,
  getOrganizationAnalytics,
  getRealTimeAnalytics,
  generateCustomReport,
  exportAnalyticsData,
  downloadExport,
  getExportHistory,
  getDisabilityTypeStats,
  getAccessibilityNeedsStats,
  getEnrollmentStatsByDisability,
  getCertificateAnalytics,
  getAttendanceAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

// Protect all routes in this router
router.use(protect);
router.use(authorize('admin', 'trainer'));

// Dashboard analytics
router.get('/dashboard', getDashboardMetrics);

// Trend analysis
router.get('/enrollment-trends', getEnrollmentTrends);
router.get('/feedback-trends', getFeedbackTrends);
router.get('/completion-rates', getCompletionRates);
router.get('/user-growth', getUserGrowthTrends);

// Performance analysis
router.get('/course-performance', getCoursePerformance);
router.get('/organization/:organizationId', getOrganizationAnalytics);

// Real-time analytics
router.get('/realtime', getRealTimeAnalytics);

// Certificate analytics
router.get('/certificates', authorize('admin', 'trainer'), getCertificateAnalytics);

// Attendance analytics
router.get('/attendance', getAttendanceAnalytics);

// Report generation
router.post('/reports/generate', generateCustomReport);

// Export functionality
router.post('/export', exportAnalyticsData);
router.get('/download/:filename', downloadExport);
router.get('/exports', getExportHistory);

// Disability analytics
router.get('/disability-type-stats', authorize('admin', 'trainer'), getDisabilityTypeStats);
router.get('/accessibility-needs-stats', authorize('admin', 'trainer'), getAccessibilityNeedsStats);
router.get('/enrollment-stats-by-disability', authorize('admin', 'trainer'), getEnrollmentStatsByDisability);

module.exports = router;