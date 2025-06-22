const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');

/**
 * Automatically update enrollment statuses based on course completion and attendance
 */
exports.autoUpdateEnrollmentStatuses = async () => {
  try {
    const currentDate = new Date();
    
    // Find all active enrollments
    const activeEnrollments = await Enrollment.find({
      status: 'enrolled'
    }).populate('course');

    const updates = [];

    for (const enrollment of activeEnrollments) {
      const course = enrollment.course;
      if (!course) continue;

      const courseEndDate = new Date(course.endDate);
      
      // Check if course has ended
      if (currentDate > courseEndDate) {
        // Get attendance records
        const attendanceRecords = await Attendance.find({
          enrollment: enrollment._id
        });

        const totalSessions = attendanceRecords.length;
        const attendedSessions = attendanceRecords.filter(att => att.status === 'present').length;
        const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

        let newStatus = 'enrolled';
        let completionDate = null;

        // Determine status based on attendance and course requirements
        if (attendanceRate >= 80) {
          // Good attendance - mark as completed
          newStatus = 'completed';
          completionDate = currentDate;
        } else if (attendanceRate >= 50) {
          // Moderate attendance - keep as enrolled but flag for review
          newStatus = 'enrolled';
        } else if (attendanceRate < 50 && totalSessions > 0) {
          // Poor attendance - mark as failed
          newStatus = 'failed';
        }

        // Update enrollment if status changed
        if (newStatus !== enrollment.status) {
          updates.push({
            enrollmentId: enrollment._id,
            oldStatus: enrollment.status,
            newStatus,
            attendanceRate,
            totalSessions,
            attendedSessions
          });

          enrollment.status = newStatus;
          if (completionDate) {
            enrollment.completionDate = completionDate;
          }
          await enrollment.save();
        }
      }
    }

    return {
      success: true,
      processed: activeEnrollments.length,
      updated: updates.length,
      updates
    };
  } catch (error) {
    console.error('Error in autoUpdateEnrollmentStatuses:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if a user can provide feedback for a course
 */
exports.canProvideFeedback = async (userId, courseId) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (!enrollment) {
      return {
        canProvide: false,
        reason: 'No enrollment found',
        details: null
      };
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return {
        canProvide: false,
        reason: 'Course not found',
        details: null
      };
    }

    const currentDate = new Date();
    const courseEndDate = new Date(course.endDate);
    
    // Get attendance records
    const attendanceRecords = await Attendance.find({
      enrollment: enrollment._id
    });

    const totalSessions = attendanceRecords.length;
    const attendedSessions = attendanceRecords.filter(att => att.status === 'present').length;

    let canProvide = false;
    let reason = '';
    let details = {
      enrollmentStatus: enrollment.status,
      courseEndDate: course.endDate,
      currentDate: currentDate,
      totalSessions,
      attendedSessions,
      attendanceRate: totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0
    };

    switch (enrollment.status) {
      case 'completed':
        canProvide = true;
        reason = 'Course completed';
        break;
      
      case 'enrolled':
        if (currentDate > courseEndDate) {
          canProvide = true;
          reason = 'Course has ended';
        } else if (attendedSessions > 0) {
          canProvide = true;
          reason = 'Has attended course sessions';
        } else {
          canProvide = false;
          reason = 'Course is ongoing and no sessions attended yet';
        }
        break;
      
      case 'dropped':
        if (attendedSessions > 0) {
          canProvide = true;
          reason = 'Attended sessions before dropping';
        } else {
          canProvide = false;
          reason = 'No sessions attended before dropping';
        }
        break;
      
      case 'failed':
        canProvide = true;
        reason = 'Course failed';
        break;
      
      default:
        canProvide = false;
        reason = 'Invalid enrollment status';
    }

    return {
      canProvide,
      reason,
      details
    };
  } catch (error) {
    console.error('Error in canProvideFeedback:', error);
    return {
      canProvide: false,
      reason: 'Error checking feedback eligibility',
      details: null
    };
  }
};

/**
 * Get enrollment statistics for a course
 */
exports.getCourseEnrollmentStats = async (courseId) => {
  try {
    const enrollments = await Enrollment.find({ course: courseId });
    const attendanceRecords = await Attendance.find({
      enrollment: { $in: enrollments.map(e => e._id) }
    });

    const stats = {
      total: enrollments.length,
      enrolled: enrollments.filter(e => e.status === 'enrolled').length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      dropped: enrollments.filter(e => e.status === 'dropped').length,
      failed: enrollments.filter(e => e.status === 'failed').length,
      averageAttendance: 0,
      completionRate: 0
    };

    // Calculate attendance rates
    const enrollmentAttendanceMap = {};
    attendanceRecords.forEach(att => {
      if (!enrollmentAttendanceMap[att.enrollment]) {
        enrollmentAttendanceMap[att.enrollment] = { total: 0, present: 0 };
      }
      enrollmentAttendanceMap[att.enrollment].total++;
      if (att.status === 'present') {
        enrollmentAttendanceMap[att.enrollment].present++;
      }
    });

    const attendanceRates = Object.values(enrollmentAttendanceMap).map(att => 
      att.total > 0 ? (att.present / att.total) * 100 : 0
    );

    stats.averageAttendance = attendanceRates.length > 0 
      ? attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length 
      : 0;

    stats.completionRate = stats.total > 0 
      ? (stats.completed / stats.total) * 100 
      : 0;

    return stats;
  } catch (error) {
    console.error('Error in getCourseEnrollmentStats:', error);
    return null;
  }
};

/**
 * Manually update enrollment status with validation
 */
exports.updateEnrollmentStatus = async (enrollmentId, newStatus, userId = null) => {
  try {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return {
        success: false,
        message: 'Enrollment not found'
      };
    }

    const oldStatus = enrollment.status;
    
    // Validate status transition
    const validTransitions = {
      'enrolled': ['completed', 'dropped', 'failed'],
      'completed': [], // Cannot change from completed
      'dropped': ['enrolled'], // Can re-enroll
      'failed': ['enrolled'] // Can retake
    };

    if (!validTransitions[oldStatus]?.includes(newStatus)) {
      return {
        success: false,
        message: `Invalid status transition from ${oldStatus} to ${newStatus}`
      };
    }

    // Update enrollment
    enrollment.status = newStatus;
    if (newStatus === 'completed' && !enrollment.completionDate) {
      enrollment.completionDate = new Date();
    }
    
    await enrollment.save();

    return {
      success: true,
      message: `Enrollment status updated from ${oldStatus} to ${newStatus}`,
      data: enrollment
    };
  } catch (error) {
    console.error('Error in updateEnrollmentStatus:', error);
    return {
      success: false,
      message: error.message
    };
  }
}; 