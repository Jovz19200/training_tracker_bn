const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { renderCompletionReportPDF } = require('./reportTemplates/completionReportTemplate');
const { renderEnrollmentReportPDF } = require('./reportTemplates/enrollmentReportTemplate');
const { renderFeedbackReportPDF } = require('./reportTemplates/feedbackReportTemplate');
const { renderComprehensiveReportPDF } = require('./reportTemplates/comprehensiveReportTemplate');

// Utility to ensure a directory exists (sustainable, works in all environments)
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Generate a certificate PDF (professional, disability-focused design)
exports.generateCertificatePDF = async (certificateData) => {
  return new Promise((resolve, reject) => {
    try {
      const { user, course, certificateNumber, issueDate, orgName, courseId, enrollmentId } = certificateData;
      
      // Ensure output directory exists
      const certDir = path.join('uploads', 'certificates');
      ensureDirExists(certDir);
      
      // Create a document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });
      
      // Set the output file path
      const filePath = path.join(certDir, `${certificateNumber}.pdf`);
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Background with subtle gradient effect
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fafbfc');
      
      // Decorative border
      doc.strokeColor('#e2e8f0').lineWidth(2);
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      
      // Inner decorative border
      doc.strokeColor('#cbd5e0').lineWidth(1);
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();

      // Header section with organization name
      doc.fillColor('#2d3748');
      doc.font('Helvetica-Bold').fontSize(24).text(orgName, 0, 60, { align: 'center' });
      
      // Certificate title with decorative elements
      doc.moveTo(100, 100).lineTo(200, 100).stroke('#3182ce');
      doc.moveTo(doc.page.width - 200, 100).lineTo(doc.page.width - 100, 100).stroke('#3182ce');
      
      doc.font('Helvetica-Bold').fontSize(36).fillColor('#1a202c').text('Certificate of Completion', 0, 110, { align: 'center' });
      
      // Decorative line under title
      doc.moveTo(100, 150).lineTo(doc.page.width - 100, 150).stroke('#3182ce');

      // Main certificate text
      doc.font('Helvetica').fontSize(16).fillColor('#4a5568').text('This is to certify that', 0, 180, { align: 'center' });
      
      // Recipient name with special styling
      doc.font('Helvetica-Bold').fontSize(32).fillColor('#2d3748').text(`${user.firstName} ${user.lastName}`, 0, 210, { align: 'center' });
      
      doc.font('Helvetica').fontSize(16).fillColor('#4a5568').text('has successfully completed the training program', 0, 250, { align: 'center' });
      
      // Course title
      doc.font('Helvetica-Bold').fontSize(24).fillColor('#2d3748').text(course.title, 0, 280, { align: 'center' });

      // Achievement message
      doc.font('Helvetica').fontSize(14).fillColor('#718096').text('demonstrating commitment to personal and professional development', 0, 320, { align: 'center' });
      doc.font('Helvetica').fontSize(14).fillColor('#718096').text('in an inclusive and accessible learning environment', 0, 340, { align: 'center' });

      // Certificate details in a styled box
      const detailsY = 380;
      doc.rect(50, detailsY, doc.page.width - 100, 80).fill('#f7fafc').stroke('#e2e8f0');
      
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#2d3748').text('Certificate Number:', 80, detailsY + 15);
      doc.font('Helvetica').fontSize(12).fillColor('#4a5568').text(certificateNumber, 200, detailsY + 15);
      
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#2d3748').text('Issue Date:', 80, detailsY + 35);
      doc.font('Helvetica').fontSize(12).fillColor('#4a5568').text(new Date(issueDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), 200, detailsY + 35);
      
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#2d3748').text('Training ID:', 80, detailsY + 55);
      doc.font('Helvetica').fontSize(12).fillColor('#4a5568').text(courseId, 200, detailsY + 55);

      // Signature section
      const signatureY = 500;
      
      // Left signature (Organization)
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#2d3748').text(orgName, 80, signatureY);
      doc.moveTo(80, signatureY + 20).lineTo(280, signatureY + 20).stroke('#2d3748');
      doc.font('Helvetica').fontSize(10).fillColor('#718096').text('Training Organization', 80, signatureY + 25);

      // Right signature (Enrollment ID as digital signature)
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#2d3748').text('Digital Verification', doc.page.width - 280, signatureY);
      doc.moveTo(doc.page.width - 280, signatureY + 20).lineTo(doc.page.width - 80, signatureY + 20).stroke('#2d3748');
      doc.font('Helvetica').fontSize(10).fillColor('#718096').text(`Enrollment ID: ${enrollmentId}`, doc.page.width - 280, signatureY + 25);

      // Footer with verification info
      doc.font('Helvetica').fontSize(10).fillColor('#a0aec0').text('This certificate can be verified online using the QR code or certificate number', 0, doc.page.height - 60, { align: 'center' });
      doc.font('Helvetica').fontSize(10).fillColor('#a0aec0').text('For accessibility support or verification assistance, contact your training organization', 0, doc.page.height - 45, { align: 'center' });

      // Finalize the PDF and end the stream
      doc.end();
      
      writeStream.on('finish', () => {
        resolve(filePath);
      });
      
      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Generate a report PDF
exports.generateReportPDF = async (reportData) => {
  return new Promise((resolve, reject) => {
    try {
      const { title, data, generatedBy, generatedDate, reportType, organizationName, period, feedback, recommendations } = reportData;
      const reportsDir = path.join('uploads', 'reports');
      ensureDirExists(reportsDir);
      const doc = new PDFDocument();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(reportsDir, `${title.replace(/\s+/g, '-')}-${timestamp}.pdf`);
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
      if (reportType === 'completion') {
        renderCompletionReportPDF(doc, {
          title,
          generatedBy,
          generatedDate,
          organizationName,
          period,
          summary: data.summary,
          topPerformers: data.topPerformers,
          pendingParticipants: data.pendingParticipants,
          feedback,
          recommendations
        });
      } else if (reportType === 'enrollment') {
        renderEnrollmentReportPDF(doc, {
          title,
          generatedBy,
          generatedDate,
          organizationName,
          period,
          summary: data.summary,
          details: data.details
        });
      } else if (reportType === 'feedback') {
        renderFeedbackReportPDF(doc, {
          title,
          generatedBy,
          generatedDate,
          organizationName,
          period,
          summary: data.summary,
          ratingDistribution: data.ratingDistribution,
          feedbackComments: data.feedbackComments
        });
      } else if (reportType === 'comprehensive') {
        renderComprehensiveReportPDF(doc, {
          title,
          generatedBy,
          generatedDate,
          organizationName,
          period,
          enrollment: data.enrollment,
          completion: data.completion,
          feedback: data.feedback,
          recommendations
        });
      } else {
        // Fallback: generic rendering
        doc.font('Helvetica-Bold').fontSize(14).text('Report Data', { align: 'left' });
        doc.moveDown();
        if (Array.isArray(data)) {
          data.forEach((item, index) => {
            doc.font('Helvetica-Bold').fontSize(12).text(`Item ${index + 1}:`);
            Object.entries(item).forEach(([key, value]) => {
              doc.font('Helvetica').fontSize(10).text(`${key}: ${value}`);
            });
            doc.moveDown();
          });
        } else if (typeof data === 'object') {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'object') {
              doc.font('Helvetica-Bold').fontSize(12).text(key);
              Object.entries(value).forEach(([subKey, subValue]) => {
                doc.font('Helvetica').fontSize(10).text(`${subKey}: ${subValue}`);
              });
            } else {
              doc.font('Helvetica').fontSize(10).text(`${key}: ${value}`);
            }
            doc.moveDown();
          });
        }
      }
      doc.end();
      writeStream.on('finish', () => {
        resolve(filePath);
      });
      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};