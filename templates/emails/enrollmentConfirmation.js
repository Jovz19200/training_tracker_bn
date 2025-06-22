const enrollmentConfirmationTemplate = (userData, courseData, enrollmentData) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Enrollment Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #007bff;
          margin: 0;
          font-size: 28px;
        }
        .header .subtitle {
          color: #666;
          font-size: 16px;
          margin-top: 5px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 25px;
        }
        .course-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #007bff;
        }
        .course-details h3 {
          color: #007bff;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #495057;
        }
        .detail-value {
          color: #212529;
        }
        .important-note {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
        .important-note h4 {
          color: #856404;
          margin-top: 0;
          margin-bottom: 10px;
        }
        .contact-info {
          background-color: #e7f3ff;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
        .contact-info h4 {
          color: #0056b3;
          margin-top: 0;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #6c757d;
          font-size: 14px;
        }
        .success-icon {
          color: #28a745;
          font-size: 24px;
          margin-right: 10px;
        }
        .btn {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 5px;
          font-weight: 500;
        }
        .btn:hover {
          background-color: #0056b3;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .container {
            padding: 20px;
          }
          .detail-row {
            flex-direction: column;
          }
          .detail-label {
            margin-bottom: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Enrollment Confirmed!</h1>
          <div class="subtitle">Your training journey begins now</div>
        </div>

        <div class="greeting">
          Dear <strong>${userData.firstName} ${userData.lastName}</strong>,
        </div>

        <p>
          <span class="success-icon">✅</span>
          Your enrollment in <strong>${courseData.title}</strong> has been successfully confirmed!
        </p>

        <div class="course-details">
          <h3>📚 Course Information</h3>
          <div class="detail-row">
            <span class="detail-label">Course Title:</span>
            <span class="detail-value">${courseData.title}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Start Date:</span>
            <span class="detail-value">${formatDate(courseData.startDate)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">End Date:</span>
            <span class="detail-value">${formatDate(courseData.endDate)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${courseData.location || 'To be determined'}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Enrollment Date:</span>
            <span class="detail-value">${formatDate(enrollmentData.enrollmentDate)}</span>
          </div>
        </div>

        <div class="important-note">
          <h4>📋 Important Information</h4>
          <ul>
            <li>Please arrive 10 minutes before the scheduled start time</li>
            <li>Bring any required materials or equipment as specified</li>
            <li>Check your email regularly for course updates and announcements</li>
            <li>Attendance will be tracked for certification purposes</li>
          </ul>
        </div>

        <div class="contact-info">
          <h4>📞 Need Help?</h4>
          <p>If you have any questions about your enrollment or the course:</p>
          <ul>
            <li><strong>Training Department:</strong> gisubizo.jovan@gmail.com</li>
            <li><strong>Phone:</strong> +250 783430138</li>
            <li><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM</li>
          </ul>
        </div>

        <p>
          We're excited to have you join us for this training program. 
          Get ready to enhance your skills and knowledge!
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="#" class="btn">View Course Details</a>
          <a href="#" class="btn">Download Schedule</a>
        </div>

        <div class="footer">
          <p>
            <strong>Training Management System</strong><br>
            This is an automated message. Please do not reply to this email.<br>
            © ${new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = enrollmentConfirmationTemplate; 