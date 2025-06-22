const nodemailer = require('nodemailer');
const { getOtpTemplate } = require('../templates/emails/otp');
const { getResetPasswordTemplate } = require('../templates/emails/resetPassword');
const { getEmailVerificationTemplate } = require('../templates/emails/emailVerification');
require('dotenv').config();
// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection failed:', error);
  } else {
    // console.log('SMTP server is ready to take messages'); // Removed or commented out
  }
});

// Send email notification
exports.sendEmail = async (options) => {
  // Create email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  // Add attachments if provided
  if (options.attachments) {
    mailOptions.attachments = options.attachments;
  }

  // Send email
  const info = await transporter.sendMail(mailOptions);

  return info;
};

// Send in-app notification
exports.sendInAppNotification = async (userId, notification) => {
  try {
    // This would save the notification to a database
    // For now, just log it
    console.log(`In-app notification for user ${userId}: ${notification.message}`);
    return true;
  } catch (error) {
    console.error('Error sending in-app notification:', error);
    return false;
  }
};

// Template for course enrollment confirmation
exports.getEnrollmentTemplate = (user, course) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Enrollment Confirmation</h2>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>You have been successfully enrolled in <strong>${course.title}</strong>.</p>
      <p><strong>Course Details:</strong></p>
      <ul>
        <li>Start Date: ${new Date(course.startDate).toLocaleDateString()}</li>
        <li>End Date: ${new Date(course.endDate).toLocaleDateString()}</li>
        <li>Location: ${course.location}</li>
      </ul>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>The Training Team</p>
    </div>
  `;
};

// Template for session reminder
exports.getSessionReminderTemplate = (user, course, session) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Training Session Reminder</h2>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>This is a reminder for your upcoming training session:</p>
      <p><strong>Course:</strong> ${course.title}</p>
      <p><strong>Session:</strong> ${session.title}</p>
      <p><strong>Date & Time:</strong> ${new Date(session.startTime).toLocaleString()} - ${new Date(session.endTime).toLocaleTimeString()}</p>
      <p><strong>Location:</strong> ${session.location || course.location}</p>
      ${session.isVirtual ? `<p><strong>Virtual Meeting Link:</strong> <a href="${session.virtualMeetingLink}">${session.virtualMeetingLink}</a></p>` : ''}
      <p>Please be on time and bring any necessary materials.</p>
      <p>Best regards,<br>The Training Team</p>
    </div>
  `;
};

exports.getOtpTemplate = getOtpTemplate;
exports.getResetPasswordTemplate = getResetPasswordTemplate;
exports.getEmailVerificationTemplate = getEmailVerificationTemplate;