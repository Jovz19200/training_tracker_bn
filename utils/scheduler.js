const cron = require('node-cron');
const { autoUpdateEnrollmentStatuses } = require('./enrollmentManager');

/**
 * Initialize scheduled tasks
 */
exports.initializeScheduler = () => {
  console.log('Initializing scheduled tasks...');

  // Auto-update enrollment statuses daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily enrollment status update...');
    try {
      const result = await autoUpdateEnrollmentStatuses();
      console.log('Enrollment status update completed:', {
        processed: result.processed,
        updated: result.updated,
        success: result.success
      });
    } catch (error) {
      console.error('Error in scheduled enrollment update:', error);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  // Auto-update enrollment statuses every hour for active courses
  cron.schedule('0 * * * *', async () => {
    console.log('Running hourly enrollment status check...');
    try {
      const result = await autoUpdateEnrollmentStatuses();
      if (result.updated > 0) {
        console.log('Hourly enrollment status update completed:', {
          processed: result.processed,
          updated: result.updated
        });
      }
    } catch (error) {
      console.error('Error in hourly enrollment update:', error);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log('Scheduled tasks initialized successfully');
};

/**
 * Manual trigger for enrollment status updates
 */
exports.triggerEnrollmentUpdate = async () => {
  try {
    const result = await autoUpdateEnrollmentStatuses();
    return result;
  } catch (error) {
    console.error('Error in manual enrollment update:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get scheduler status
 */
exports.getSchedulerStatus = () => {
  return {
    status: 'active',
    tasks: [
      {
        name: 'Daily Enrollment Status Update',
        schedule: '0 2 * * *',
        description: 'Updates enrollment statuses based on course completion and attendance'
      },
      {
        name: 'Hourly Enrollment Status Check',
        schedule: '0 * * * *',
        description: 'Checks and updates enrollment statuses for active courses'
      }
    ]
  };
}; 