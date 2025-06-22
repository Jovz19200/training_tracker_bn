const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Feedback = require('../models/Feedback');
const Organization = require('../models/Organization');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const { generateReportPDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

// @desc    Get dashboard metrics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin, Trainer)
exports.getDashboardMetrics = async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastYear = new Date(currentDate.getFullYear() - 1, 0, 1);

    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({ status: 'enrolled' });
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

    // Recent activity
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: lastMonth } });
    const newCoursesThisMonth = await Course.countDocuments({ createdAt: { $gte: lastMonth } });
    const newEnrollmentsThisMonth = await Enrollment.countDocuments({ enrollmentDate: { $gte: lastMonth } });

    // Completion rate
    const totalEnrollments = await Enrollment.countDocuments();
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments * 100).toFixed(2) : 0;

    // Average ratings
    const feedbackAggregation = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageOverallRating: { $avg: '$overallRating' },
          averageContentRating: { $avg: '$contentRating' },
          averageInstructorRating: { $avg: '$instructorRating' },
          totalFeedback: { $sum: 1 }
        }
      }
    ]);

    const averageRatings = feedbackAggregation[0] || {
      averageOverallRating: 0,
      averageContentRating: 0,
      averageInstructorRating: 0,
      totalFeedback: 0
    };

    // Recent feedback
    const recentFeedback = await Feedback.find()
      .populate('user', 'firstName lastName')
      .populate('course', 'title')
      .sort({ submissionDate: -1 })
      .limit(5);

    // Upcoming courses
    const upcomingCourses = await Course.find({
      startDate: { $gte: currentDate }
    })
      .populate('instructor', 'firstName lastName')
      .sort({ startDate: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCourses,
          activeEnrollments,
          completionRate: parseFloat(completionRate)
        },
        recentActivity: {
          newUsersThisMonth,
          newCoursesThisMonth,
          newEnrollmentsThisMonth
        },
        ratings: {
          overall: parseFloat(averageRatings.averageOverallRating.toFixed(2)) || 0,
          content: parseFloat(averageRatings.averageContentRating.toFixed(2)) || 0,
          instructor: parseFloat(averageRatings.averageInstructorRating.toFixed(2)) || 0,
          totalFeedback: averageRatings.totalFeedback
        },
        recentFeedback,
        upcomingCourses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get enrollment trends
// @route   GET /api/analytics/enrollment-trends
// @access  Private (Admin, Trainer)
exports.getEnrollmentTrends = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate, courseId, organizationId } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        enrollmentDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 12 months
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      dateFilter = { enrollmentDate: { $gte: lastYear } };
    }

    let courseFilter = {};
    if (courseId) {
      courseFilter = { course: courseId };
    }

    let organizationFilter = {};
    if (organizationId) {
      organizationFilter = { organization: organizationId };
    }

    const matchStage = { ...dateFilter, ...courseFilter, ...organizationFilter };

    let groupStage = {};
    if (period === 'monthly') {
      groupStage = {
        $group: {
          _id: {
            year: { $year: '$enrollmentDate' },
            month: { $month: '$enrollmentDate' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          dropped: {
            $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
          }
        }
      };
    } else if (period === 'weekly') {
      groupStage = {
        $group: {
          _id: {
            year: { $year: '$enrollmentDate' },
            week: { $week: '$enrollmentDate' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          dropped: {
            $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
          }
        }
      };
    }

    const trends = await Enrollment.aggregate([
      { $match: matchStage },
      groupStage,
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format the data for frontend charts
    const formattedTrends = trends.map(trend => ({
      period: period === 'monthly' 
        ? `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`
        : `${trend._id.year}-W${String(trend._id.week).padStart(2, '0')}`,
      enrollments: trend.count,
      completed: trend.completed,
      dropped: trend.dropped,
      completionRate: trend.count > 0 ? ((trend.completed / trend.count) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      success: true,
      data: formattedTrends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get feedback trends and analysis
// @route   GET /api/analytics/feedback-trends
// @access  Private (Admin, Trainer)
exports.getFeedbackTrends = async (req, res) => {
  try {
    const { startDate, endDate, courseId, instructorId } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        submissionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 6 months
      const last6Months = new Date();
      last6Months.setMonth(last6Months.getMonth() - 6);
      dateFilter = { submissionDate: { $gte: last6Months } };
    }

    let courseFilter = {};
    if (courseId) {
      courseFilter = { course: courseId };
    }

    let instructorFilter = {};
    if (instructorId) {
      // Get courses by instructor
      const instructorCourses = await Course.find({ instructor: instructorId }).select('_id');
      instructorFilter = { course: { $in: instructorCourses.map(c => c._id) } };
    }

    const matchStage = { ...dateFilter, ...courseFilter, ...instructorFilter };

    // Monthly feedback trends
    const monthlyTrends = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$submissionDate' },
            month: { $month: '$submissionDate' }
          },
          count: { $sum: 1 },
          avgOverallRating: { $avg: '$overallRating' },
          avgContentRating: { $avg: '$contentRating' },
          avgInstructorRating: { $avg: '$instructorRating' },
          avgFacilitiesRating: { $avg: '$facilitiesRating' },
          avgAccessibilityRating: { $avg: '$accessibilityRating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$overallRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top performing courses
    const topCourses = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$course',
          avgRating: { $avg: '$overallRating' },
          totalFeedback: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$course.title',
          avgRating: { $round: ['$avgRating', 2] },
          totalFeedback: 1
        }
      }
    ]);

    // Format monthly trends
    const formattedTrends = monthlyTrends.map(trend => ({
      period: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
      feedbackCount: trend.count,
      avgOverallRating: parseFloat(trend.avgOverallRating.toFixed(2)),
      avgContentRating: parseFloat(trend.avgContentRating.toFixed(2)),
      avgInstructorRating: parseFloat(trend.avgInstructorRating.toFixed(2)),
      avgFacilitiesRating: parseFloat(trend.avgFacilitiesRating.toFixed(2)),
      avgAccessibilityRating: parseFloat(trend.avgAccessibilityRating.toFixed(2))
    }));

    res.status(200).json({
      success: true,
      data: {
        monthlyTrends: formattedTrends,
        ratingDistribution,
        topCourses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get completion rate analysis
// @route   GET /api/analytics/completion-rates
// @access  Private (Admin, Trainer)
exports.getCompletionRates = async (req, res) => {
  try {
    const { startDate, endDate, courseId, organizationId } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        enrollmentDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let courseFilter = {};
    if (courseId) {
      courseFilter = { course: courseId };
    }

    let organizationFilter = {};
    if (organizationId) {
      organizationFilter = { organization: organizationId };
    }

    const matchStage = { ...dateFilter, ...courseFilter, ...organizationFilter };

    // Overall completion rate
    const overallStats = await Enrollment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          dropped: { $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'enrolled'] }, 1, 0] } }
        }
      }
    ]);

    // Completion rate by course
    const courseCompletionRates = await Enrollment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$course',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          dropped: { $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$course.title',
          total: 1,
          completed: 1,
          dropped: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    // Completion rate by organization
    const organizationCompletionRates = await Enrollment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$organization',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          dropped: { $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'organizations',
          localField: '_id',
          foreignField: '_id',
          as: 'organization'
        }
      },
      { $unwind: '$organization' },
      {
        $project: {
          organizationId: '$_id',
          organizationName: '$organization.name',
          total: 1,
          completed: 1,
          dropped: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    const overall = overallStats[0] || { total: 0, completed: 0, dropped: 0, inProgress: 0 };
    const overallCompletionRate = overall.total > 0 
      ? parseFloat(((overall.completed / overall.total) * 100).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overall: {
          total: overall.total,
          completed: overall.completed,
          dropped: overall.dropped,
          inProgress: overall.inProgress,
          completionRate: overallCompletionRate
        },
        byCourse: courseCompletionRates,
        byOrganization: organizationCompletionRates
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate custom report
// @route   POST /api/analytics/reports/generate
// @access  Private (Admin, Trainer)
exports.generateCustomReport = async (req, res) => {
  try {
    const { 
      reportType, 
      startDate, 
      endDate, 
      courseId, 
      organizationId, 
      format = 'pdf',
      includeCharts = true 
    } = req.body;

    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    let reportData = {};
    let reportTitle = '';

    switch (reportType) {
      case 'enrollment':
        reportTitle = 'Enrollment Report';
        reportData = await generateEnrollmentReport(startDate, endDate, courseId, organizationId);
        break;
      
      case 'completion':
        reportTitle = 'Completion Rate Report';
        reportData = await generateCompletionReport(startDate, endDate, courseId, organizationId);
        break;
      
      case 'feedback':
        reportTitle = 'Feedback Analysis Report';
        reportData = await generateFeedbackReport(startDate, endDate, courseId, organizationId);
        break;
      
      case 'comprehensive':
        reportTitle = 'Comprehensive Training Report';
        reportData = await generateComprehensiveReport(startDate, endDate, courseId, organizationId);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    if (format === 'pdf') {
      const pdfPath = await generateReportPDF({
        title: reportTitle,
        data: reportData,
        generatedBy: `${req.user.firstName} ${req.user.lastName}`,
        generatedDate: new Date(),
        includeCharts
      });

      res.status(200).json({
        success: true,
        data: {
          reportId: Date.now().toString(),
          downloadUrl: `/api/analytics/reports/download/${pdfPath.split('/').pop()}`,
          message: 'Report generated successfully'
        }
      });
    } else {
      // For JSON format, return the data directly
      res.status(200).json({
        success: true,
        data: {
          reportId: Date.now().toString(),
          reportTitle,
          reportData,
          generatedBy: `${req.user.firstName} ${req.user.lastName}`,
          generatedDate: new Date()
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper functions for report generation
async function generateEnrollmentReport(startDate, endDate, courseId, organizationId) {
  const dateFilter = startDate && endDate ? {
    enrollmentDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
  } : {};

  const courseFilter = courseId ? { course: courseId } : {};
  const orgFilter = organizationId ? { organization: organizationId } : {};

  const enrollments = await Enrollment.find({ ...dateFilter, ...courseFilter, ...orgFilter })
    .populate('user', 'firstName lastName email')
    .populate('course', 'title startDate endDate')
    .populate('organization', 'name');

  const stats = await Enrollment.aggregate([
    { $match: { ...dateFilter, ...courseFilter, ...orgFilter } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    summary: {
      totalEnrollments: enrollments.length,
      statusBreakdown: stats
    },
    details: enrollments
  };
}

async function generateCompletionReport(startDate, endDate, courseId, organizationId) {
  const dateFilter = startDate && endDate ? {
    enrollmentDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
  } : {};

  const courseFilter = courseId ? { course: courseId } : {};
  const orgFilter = organizationId ? { organization: organizationId } : {};

  const completionStats = await Enrollment.aggregate([
    { $match: { ...dateFilter, ...courseFilter, ...orgFilter } },
    {
      $group: {
        _id: '$course',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        dropped: { $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] } }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' }
  ]);

  return {
    summary: {
      totalCourses: completionStats.length,
      averageCompletionRate: completionStats.reduce((acc, stat) => {
        return acc + (stat.completed / stat.total * 100);
      }, 0) / completionStats.length
    },
    courseStats: completionStats
  };
}

async function generateFeedbackReport(startDate, endDate, courseId, organizationId) {
  const dateFilter = startDate && endDate ? {
    submissionDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
  } : {};

  const courseFilter = courseId ? { course: courseId } : {};

  const feedbackStats = await Feedback.aggregate([
    { $match: { ...dateFilter, ...courseFilter } },
    {
      $group: {
        _id: null,
        totalFeedback: { $sum: 1 },
        avgOverallRating: { $avg: '$overallRating' },
        avgContentRating: { $avg: '$contentRating' },
        avgInstructorRating: { $avg: '$instructorRating' }
      }
    }
  ]);

  const ratingDistribution = await Feedback.aggregate([
    { $match: { ...dateFilter, ...courseFilter } },
    {
      $group: {
        _id: '$overallRating',
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return {
    summary: feedbackStats[0] || {},
    ratingDistribution,
    totalFeedback: feedbackStats[0]?.totalFeedback || 0
  };
}

async function generateComprehensiveReport(startDate, endDate, courseId, organizationId) {
  const [enrollmentData, completionData, feedbackData] = await Promise.all([
    generateEnrollmentReport(startDate, endDate, courseId, organizationId),
    generateCompletionReport(startDate, endDate, courseId, organizationId),
    generateFeedbackReport(startDate, endDate, courseId, organizationId)
  ]);

  return {
    enrollment: enrollmentData,
    completion: completionData,
    feedback: feedbackData,
    period: {
      startDate: startDate || 'All time',
      endDate: endDate || 'Present'
    }
  };
}

// @desc    Get user growth trends
// @route   GET /api/analytics/user-growth
// @access  Private (Admin, Trainer)
exports.getUserGrowthTrends = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate, organizationId } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 12 months
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: lastYear } };
    }

    let organizationFilter = {};
    if (organizationId) {
      organizationFilter = { organization: organizationId };
    }

    const matchStage = { ...dateFilter, ...organizationFilter };

    let groupStage = {};
    if (period === 'monthly') {
      groupStage = {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      };
    } else if (period === 'weekly') {
      groupStage = {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          },
          newUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      };
    }

    const trends = await User.aggregate([
      { $match: matchStage },
      groupStage,
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Calculate cumulative growth
    let cumulativeUsers = 0;
    const formattedTrends = trends.map(trend => {
      cumulativeUsers += trend.newUsers;
      return {
        period: period === 'monthly' 
          ? `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`
          : `${trend._id.year}-W${String(trend._id.week).padStart(2, '0')}`,
        newUsers: trend.newUsers,
        activeUsers: trend.activeUsers,
        cumulativeUsers
      };
    });

    res.status(200).json({
      success: true,
      data: formattedTrends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get course performance analysis
// @route   GET /api/analytics/course-performance
// @access  Private (Admin, Trainer)
exports.getCoursePerformance = async (req, res) => {
  try {
    const { startDate, endDate, organizationId } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      };
    }

    let organizationFilter = {};
    if (organizationId) {
      organizationFilter = { organization: organizationId };
    }

    const courseMatchStage = { ...dateFilter, ...organizationFilter };

    // Get course performance metrics
    const coursePerformance = await Course.aggregate([
      { $match: courseMatchStage },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments'
        }
      },
      {
        $lookup: {
          from: 'feedback',
          localField: '_id',
          foreignField: 'course',
          as: 'feedback'
        }
      },
      {
        $project: {
          courseId: '$_id',
          title: '$title',
          instructor: '$instructor',
          startDate: '$startDate',
          endDate: '$endDate',
          maxCapacity: '$maxCapacity',
          totalEnrollments: { $size: '$enrollments' },
          completedEnrollments: {
            $size: {
              $filter: {
                input: '$enrollments',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          averageRating: { $avg: '$feedback.overallRating' },
          feedbackCount: { $size: '$feedback' },
          completionRate: {
            $cond: [
              { $gt: [{ $size: '$enrollments' }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: '$enrollments',
                            cond: { $eq: ['$$this.status', 'completed'] }
                          }
                        }
                      },
                      { $size: '$enrollments' }
                    ]
                  },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    // Get top performing courses
    const topCourses = coursePerformance
      .filter(course => course.feedbackCount > 0)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 10);

    // Get courses needing attention (low completion rate or low ratings)
    const coursesNeedingAttention = coursePerformance.filter(course => 
      course.completionRate < 70 || (course.averageRating && course.averageRating < 3.0)
    );

    res.status(200).json({
      success: true,
      data: {
        coursePerformance,
        topCourses,
        coursesNeedingAttention,
        summary: {
          totalCourses: coursePerformance.length,
          averageCompletionRate: coursePerformance.reduce((acc, course) => 
            acc + course.completionRate, 0) / coursePerformance.length,
          averageRating: coursePerformance
            .filter(course => course.averageRating)
            .reduce((acc, course) => acc + course.averageRating, 0) / 
            coursePerformance.filter(course => course.averageRating).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get organization analytics
// @route   GET /api/analytics/organization/:organizationId
// @access  Private (Admin, Trainer)
exports.getOrganizationAnalytics = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      };
    }

    // Organization overview
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // User statistics
    const userStats = await User.aggregate([
      { $match: { organization: organizationId, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      }
    ]);

    // Enrollment statistics
    const enrollmentStats = await Enrollment.aggregate([
      { $match: { organization: organizationId, ...dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Course statistics
    const courseStats = await Course.aggregate([
      { $match: { organization: organizationId, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          activeCourses: { $sum: { $cond: [{ $gte: ['$endDate', new Date()] }, 1, 0] } }
        }
      }
    ]);

    // Feedback statistics
    const feedbackStats = await Feedback.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: 'enrollment',
          foreignField: '_id',
          as: 'enrollment'
        }
      },
      { $unwind: '$enrollment' },
      { $match: { 'enrollment.organization': organizationId, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$overallRating' }
        }
      }
    ]);

    // Monthly trends for the organization
    const monthlyTrends = await Enrollment.aggregate([
      { $match: { organization: organizationId, ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          enrollments: { $sum: 1 },
          completions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formattedTrends = monthlyTrends.map(trend => ({
      period: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
      enrollments: trend.enrollments,
      completions: trend.completions,
      completionRate: trend.enrollments > 0 ? ((trend.completions / trend.enrollments) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          description: organization.description
        },
        overview: {
          users: userStats[0] || { totalUsers: 0, activeUsers: 0 },
          enrollments: enrollmentStats,
          courses: courseStats[0] || { totalCourses: 0, activeCourses: 0 },
          feedback: feedbackStats[0] || { totalFeedback: 0, averageRating: 0 }
        },
        trends: formattedTrends
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get real-time analytics
// @route   GET /api/analytics/realtime
// @access  Private (Admin, Trainer)
exports.getRealTimeAnalytics = async (req, res) => {
  try {
    const currentDate = new Date();
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const thisWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Today's activity
    const todayEnrollments = await Enrollment.countDocuments({ enrollmentDate: { $gte: today } });
    const todayCompletions = await Enrollment.countDocuments({ 
      status: 'completed', 
      updatedAt: { $gte: today } 
    });
    const todayFeedback = await Feedback.countDocuments({ submissionDate: { $gte: today } });

    // This week's activity
    const weekEnrollments = await Enrollment.countDocuments({ enrollmentDate: { $gte: thisWeek } });
    const weekCompletions = await Enrollment.countDocuments({ 
      status: 'completed', 
      updatedAt: { $gte: thisWeek } 
    });

    // This month's activity
    const monthEnrollments = await Enrollment.countDocuments({ enrollmentDate: { $gte: thisMonth } });
    const monthCompletions = await Enrollment.countDocuments({ 
      status: 'completed', 
      updatedAt: { $gte: thisMonth } 
    });

    // Active sessions (users who have been active in the last 24 hours)
    const activeUsers = await User.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });

    // Current ongoing courses
    const ongoingCourses = await Course.countDocuments({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });

    res.status(200).json({
      success: true,
      data: {
        today: {
          enrollments: todayEnrollments,
          completions: todayCompletions,
          feedback: todayFeedback
        },
        thisWeek: {
          enrollments: weekEnrollments,
          completions: weekCompletions
        },
        thisMonth: {
          enrollments: monthEnrollments,
          completions: monthCompletions
        },
        realtime: {
          activeUsers,
          ongoingCourses
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Export analytics data
// @route   POST /api/analytics/export
// @access  Private (Admin, Trainer)
exports.exportAnalyticsData = async (req, res) => {
  try {
    const { 
      dataType, 
      format = 'excel', 
      startDate, 
      endDate, 
      courseId, 
      organizationId,
      includeCharts = false 
    } = req.body;

    if (!dataType) {
      return res.status(400).json({
        success: false,
        message: 'Data type is required'
      });
    }

    let data = {};
    let filename = '';

    // Collect data based on type
    switch (dataType) {
      case 'dashboard':
        filename = 'dashboard-analytics';
        data = await collectDashboardData();
        break;
      
      case 'enrollment-trends':
        filename = 'enrollment-trends';
        data = await collectEnrollmentTrendsData(startDate, endDate, courseId, organizationId);
        break;
      
      case 'feedback-trends':
        filename = 'feedback-trends';
        data = await collectFeedbackTrendsData(startDate, endDate, courseId);
        break;
      
      case 'completion-rates':
        filename = 'completion-rates';
        data = await collectCompletionRatesData(startDate, endDate, courseId, organizationId);
        break;
      
      case 'course-performance':
        filename = 'course-performance';
        data = await collectCoursePerformanceData(startDate, endDate, organizationId);
        break;
      
      case 'comprehensive':
        filename = 'comprehensive-analytics';
        // Collect all data types
        const [dashboard, enrollment, feedback, completion, course] = await Promise.all([
          collectDashboardData(),
          collectEnrollmentTrendsData(startDate, endDate, courseId, organizationId),
          collectFeedbackTrendsData(startDate, endDate, courseId),
          collectCompletionRatesData(startDate, endDate, courseId, organizationId),
          collectCoursePerformanceData(startDate, endDate, organizationId)
        ]);
        data = {
          dashboard,
          enrollmentTrends: enrollment,
          feedbackTrends: feedback,
          completionRates: completion,
          coursePerformance: course
        };
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid data type'
        });
    }

    // Add timestamp to filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    filename = `${filename}-${timestamp}`;

    let filePath = '';
    let downloadUrl = '';

    // Export based on format
    switch (format.toLowerCase()) {
      case 'csv':
        const { exportToCSV } = require('../utils/dataExporter');
        filePath = await exportToCSV(Array.isArray(data) ? data : [data], filename);
        downloadUrl = `/api/analytics/download/${path.basename(filePath)}`;
        break;
      
      case 'excel':
        if (dataType === 'comprehensive') {
          const { exportAnalyticsToExcel } = require('../utils/dataExporter');
          filePath = await exportAnalyticsToExcel(data, filename);
        } else {
          const { exportToExcel } = require('../utils/dataExporter');
          filePath = await exportToExcel(Array.isArray(data) ? data : [data], filename, dataType);
        }
        downloadUrl = `/api/analytics/download/${path.basename(filePath)}`;
        break;
      
      case 'json':
        const { exportToJSON } = require('../utils/dataExporter');
        filePath = await exportToJSON(data, filename);
        downloadUrl = `/api/analytics/download/${path.basename(filePath)}`;
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export format. Supported formats: csv, excel, json'
        });
    }

    res.status(200).json({
      success: true,
      data: {
        exportId: Date.now().toString(),
        filename: path.basename(filePath),
        downloadUrl,
        format: format.toLowerCase(),
        dataType,
        message: 'Export completed successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper functions for data collection (without response objects)
async function collectDashboardData() {
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastYear = new Date(currentDate.getFullYear() - 1, 0, 1);

  // Basic counts
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const activeEnrollments = await Enrollment.countDocuments({ status: 'enrolled' });
  const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

  // Recent activity
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: lastMonth } });
  const newCoursesThisMonth = await Course.countDocuments({ createdAt: { $gte: lastMonth } });
  const newEnrollmentsThisMonth = await Enrollment.countDocuments({ enrollmentDate: { $gte: lastMonth } });

  // Completion rate
  const totalEnrollments = await Enrollment.countDocuments();
  const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments * 100).toFixed(2) : 0;

  // Average ratings
  const feedbackAggregation = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        averageOverallRating: { $avg: '$overallRating' },
        averageContentRating: { $avg: '$contentRating' },
        averageInstructorRating: { $avg: '$instructorRating' },
        totalFeedback: { $sum: 1 }
      }
    }
  ]);

  const averageRatings = feedbackAggregation[0] || {
    averageOverallRating: 0,
    averageContentRating: 0,
    averageInstructorRating: 0,
    totalFeedback: 0
  };

  // Recent feedback
  const recentFeedback = await Feedback.find()
    .populate('user', 'firstName lastName')
    .populate('course', 'title')
    .sort({ submissionDate: -1 })
    .limit(5);

  // Upcoming courses
  const upcomingCourses = await Course.find({
    startDate: { $gte: currentDate }
  })
    .populate('instructor', 'firstName lastName')
    .sort({ startDate: 1 })
    .limit(5);

  return {
    overview: {
      totalUsers,
      totalCourses,
      activeEnrollments,
      completionRate: parseFloat(completionRate)
    },
    recentActivity: {
      newUsersThisMonth,
      newCoursesThisMonth,
      newEnrollmentsThisMonth
    },
    ratings: {
      overall: parseFloat(averageRatings.averageOverallRating.toFixed(2)) || 0,
      content: parseFloat(averageRatings.averageContentRating.toFixed(2)) || 0,
      instructor: parseFloat(averageRatings.averageInstructorRating.toFixed(2)) || 0,
      totalFeedback: averageRatings.totalFeedback
    },
    recentFeedback,
    upcomingCourses
  };
}

async function collectEnrollmentTrendsData(startDate, endDate, courseId, organizationId) {
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      enrollmentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  } else {
    // Default to last 12 months
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    dateFilter = { enrollmentDate: { $gte: lastYear } };
  }

  let courseFilter = {};
  if (courseId) {
    courseFilter = { course: courseId };
  }

  let organizationFilter = {};
  if (organizationId) {
    organizationFilter = { organization: organizationId };
  }

  const matchStage = { ...dateFilter, ...courseFilter, ...organizationFilter };

  const groupStage = {
    $group: {
      _id: {
        year: { $year: '$enrollmentDate' },
        month: { $month: '$enrollmentDate' }
      },
      count: { $sum: 1 },
      completed: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      },
      dropped: {
        $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
      }
    }
  };

  const trends = await Enrollment.aggregate([
    { $match: matchStage },
    groupStage,
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format the data for frontend charts
  return trends.map(trend => ({
    period: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
    enrollments: trend.count,
    completed: trend.completed,
    dropped: trend.dropped,
    completionRate: trend.count > 0 ? ((trend.completed / trend.count) * 100).toFixed(2) : 0
  }));
}

async function collectFeedbackTrendsData(startDate, endDate, courseId) {
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      submissionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  } else {
    // Default to last 6 months
    const last6Months = new Date();
    last6Months.setMonth(last6Months.getMonth() - 6);
    dateFilter = { submissionDate: { $gte: last6Months } };
  }

  let courseFilter = {};
  if (courseId) {
    courseFilter = { course: courseId };
  }

  const matchStage = { ...dateFilter, ...courseFilter };

  // Monthly feedback trends
  const monthlyTrends = await Feedback.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$submissionDate' },
          month: { $month: '$submissionDate' }
        },
        count: { $sum: 1 },
        avgOverallRating: { $avg: '$overallRating' },
        avgContentRating: { $avg: '$contentRating' },
        avgInstructorRating: { $avg: '$instructorRating' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Rating distribution
  const ratingDistribution = await Feedback.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$overallRating',
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Format monthly trends
  const formattedTrends = monthlyTrends.map(trend => ({
    period: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
    feedbackCount: trend.count,
    avgOverallRating: parseFloat(trend.avgOverallRating.toFixed(2)),
    avgContentRating: parseFloat(trend.avgContentRating.toFixed(2)),
    avgInstructorRating: parseFloat(trend.avgInstructorRating.toFixed(2))
  }));

  return {
    monthlyTrends: formattedTrends,
    ratingDistribution
  };
}

async function collectCompletionRatesData(startDate, endDate, courseId, organizationId) {
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      enrollmentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  }

  let courseFilter = {};
  if (courseId) {
    courseFilter = { course: courseId };
  }

  let organizationFilter = {};
  if (organizationId) {
    organizationFilter = { organization: organizationId };
  }

  const matchStage = { ...dateFilter, ...courseFilter, ...organizationFilter };

  // Overall completion rate
  const overallStats = await Enrollment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        dropped: { $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'enrolled'] }, 1, 0] } }
      }
    }
  ]);

  const overall = overallStats[0] || { total: 0, completed: 0, dropped: 0, inProgress: 0 };
  const overallCompletionRate = overall.total > 0 
    ? parseFloat(((overall.completed / overall.total) * 100).toFixed(2))
    : 0;

  return {
    overall: {
      total: overall.total,
      completed: overall.completed,
      dropped: overall.dropped,
      inProgress: overall.inProgress,
      completionRate: overallCompletionRate
    }
  };
}

async function collectCoursePerformanceData(startDate, endDate, organizationId) {
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };
  }

  let organizationFilter = {};
  if (organizationId) {
    organizationFilter = { organization: organizationId };
  }

  const courseMatchStage = { ...dateFilter, ...organizationFilter };

  // Get course performance metrics
  const coursePerformance = await Course.aggregate([
    { $match: courseMatchStage },
    {
      $lookup: {
        from: 'enrollments',
        localField: '_id',
        foreignField: 'course',
        as: 'enrollments'
      }
    },
    {
      $lookup: {
        from: 'feedback',
        localField: '_id',
        foreignField: 'course',
        as: 'feedback'
      }
    },
    {
      $project: {
        courseId: '$_id',
        title: '$title',
        instructor: '$instructor',
        startDate: '$startDate',
        endDate: '$endDate',
        maxCapacity: '$maxCapacity',
        totalEnrollments: { $size: '$enrollments' },
        completedEnrollments: {
          $size: {
            $filter: {
              input: '$enrollments',
              cond: { $eq: ['$$this.status', 'completed'] }
            }
          }
        },
        averageRating: { $avg: '$feedback.overallRating' },
        feedbackCount: { $size: '$feedback' },
        completionRate: {
          $cond: [
            { $gt: [{ $size: '$enrollments' }, 0] },
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: '$enrollments',
                          cond: { $eq: ['$$this.status', 'completed'] }
                        }
                      }
                    },
                    { $size: '$enrollments' }
                  ]
                },
                100
              ]
            },
            0
          ]
        }
      }
    },
    { $sort: { completionRate: -1 } }
  ]);

  return coursePerformance;
}

// @desc    Download exported file
// @route   GET /api/analytics/download/:filename
// @access  Private (Admin, Trainer)
exports.downloadExport = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads', 'exports', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Export file not found'
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.csv':
        contentType = 'text/csv';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.json':
        contentType = 'application/json';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get export history
// @route   GET /api/analytics/exports
// @access  Private (Admin, Trainer)
exports.getExportHistory = async (req, res) => {
  try {
    const uploadsDir = path.join('uploads', 'exports');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const files = fs.readdirSync(uploadsDir);
    const exportHistory = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        downloadUrl: `/api/analytics/download/${filename}`
      };
    }).sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      data: exportHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Disability analytics: users by disabilityType
exports.getDisabilityTypeStats = async (req, res) => {
  try {
    const stats = await require('../models/User').aggregate([
      { $match: { hasDisability: true } },
      { $group: { _id: '$disabilityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Disability analytics: users by accessibilityNeeds
exports.getAccessibilityNeedsStats = async (req, res) => {
  try {
    const stats = await require('../models/User').aggregate([
      { $match: { hasDisability: true, accessibilityNeeds: { $exists: true, $ne: '' } } },
      { $group: { _id: '$accessibilityNeeds', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Disability analytics: enrollments by disabilityType
exports.getEnrollmentStatsByDisability = async (req, res) => {
  try {
    const Enrollment = require('../models/Enrollment');
    const User = require('../models/User');
    // Join enrollments with users to get disabilityType
    const stats = await Enrollment.aggregate([
      { $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
      }},
      { $unwind: '$userInfo' },
      { $match: { 'userInfo.hasDisability': true } },
      { $group: {
          _id: '$userInfo.disabilityType',
          enrollments: { $sum: 1 },
          completions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
      }},
      { $sort: { enrollments: -1 } }
    ]);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get certificate analytics
// @route   GET /api/analytics/certificates
// @access  Private (Admin, Trainer)
exports.getCertificateAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, organizationId } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        issueDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 12 months
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      dateFilter = { issueDate: { $gte: lastYear } };
    }

    let organizationFilter = {};
    if (organizationId) {
      organizationFilter = { organization: organizationId };
    }

    // Certificate issuance trends
    const certificateTrends = await Certificate.aggregate([
      { $match: { ...dateFilter, ...organizationFilter } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: {
            year: { $year: '$issueDate' },
            month: { $month: '$issueDate' }
          },
          count: { $sum: 1 },
          disabilityUsers: {
            $sum: { $cond: [{ $eq: ['$user.hasDisability', true] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Disability-focused analytics
    const disabilityAnalytics = await Certificate.aggregate([
      { $match: { ...dateFilter, ...organizationFilter } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.disabilityType',
          count: { $sum: 1 },
          percentage: { $avg: 1 }
        }
      }
    ]);

    // Certificate verification stats
    const totalCertificates = await Certificate.countDocuments({ ...dateFilter, ...organizationFilter });
    const verifiedCertificates = await Certificate.countDocuments({ 
      ...dateFilter, 
      ...organizationFilter,
      verificationUrl: { $exists: true, $ne: null }
    });

    // Recent certificates
    const recentCertificates = await Certificate.find({ ...dateFilter, ...organizationFilter })
      .populate('user', 'firstName lastName hasDisability disabilityType')
      .populate('course', 'title')
      .populate('enrollment')
      .sort({ issueDate: -1 })
      .limit(10);

    // Format trends data
    const formattedTrends = certificateTrends.map(trend => ({
      period: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
      totalIssued: trend.count,
      disabilityUsers: trend.disabilityUsers,
      accessibilityRate: trend.count > 0 ? ((trend.disabilityUsers / trend.count) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        trends: formattedTrends,
        disabilityAnalytics,
        verification: {
          total: totalCertificates,
          verified: verifiedCertificates,
          verificationRate: totalCertificates > 0 ? ((verifiedCertificates / totalCertificates) * 100).toFixed(2) : 0
        },
        recentCertificates
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get manual attendance analytics
// @route   GET /api/analytics/attendance
// @access  Private (Admin, Trainer)
exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, courseId, organizationId } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        checkInTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let courseFilter = {};
    if (courseId) {
      courseFilter = { course: courseId };
    }

    let organizationFilter = {};
    if (organizationId) {
      organizationFilter = { organization: organizationId };
    }

    // Attendance by verification method
    const attendanceByMethod = await Attendance.aggregate([
      { $match: { ...dateFilter, ...courseFilter, ...organizationFilter } },
      {
        $lookup: {
          from: 'enrollments',
          localField: 'enrollment',
          foreignField: '_id',
          as: 'enrollment'
        }
      },
      { $unwind: '$enrollment' },
      {
        $lookup: {
          from: 'users',
          localField: 'enrollment.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$verificationMethod',
          count: { $sum: 1 },
          disabilityUsers: {
            $sum: { $cond: [{ $eq: ['$user.hasDisability', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Attendance trends
    const attendanceTrends = await Attendance.aggregate([
      { $match: { ...dateFilter, ...courseFilter, ...organizationFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$checkInTime' },
            month: { $month: '$checkInTime' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Manual attendance stats
    const manualAttendance = await Attendance.countDocuments({
      ...dateFilter,
      ...courseFilter,
      ...organizationFilter,
      verificationMethod: 'manual'
    });

    const totalAttendance = await Attendance.countDocuments({
      ...dateFilter,
      ...courseFilter,
      ...organizationFilter
    });

    res.status(200).json({
      success: true,
      data: {
        byMethod: attendanceByMethod,
        trends: attendanceTrends,
        manualAttendance: {
          total: manualAttendance,
          percentage: totalAttendance > 0 ? ((manualAttendance / totalAttendance) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 