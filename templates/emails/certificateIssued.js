// Certificate Issued Email Template - Disability-Focused Training
module.exports = function certificateIssuedTemplate(user, course, certificate, orgName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2d3748; font-size: 28px; margin: 0; font-weight: 700;">🎓 Congratulations!</h1>
        <p style="color: #4a5568; font-size: 18px; margin: 8px 0 0 0;">You successfully completed your ${orgName} training!</p>
      </div>

      <!-- Main Content -->
      <div style="background: #f7fafc; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #3182ce;">
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
          Your official training certificate is attached to this email. You can also verify your certificate anytime using the QR code below or visiting our verification portal.
        </p>
        
        <div style="background: #fff; border-radius: 6px; padding: 16px; margin: 16px 0; text-align: center;">
          <p style="color: #4a5568; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">Certificate Number</p>
          <p style="color: #2d3748; font-size: 16px; margin: 0; font-family: monospace; letter-spacing: 1px;">${certificate.certificateNumber}</p>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <img src="${certificate.verificationQrCode}" alt="Certificate QR Code" style="width: 120px; height: 120px; border-radius: 8px; border: 2px solid #e2e8f0;"/>
          <p style="color: #718096; font-size: 12px; margin: 8px 0 0 0;">Scan to verify your certificate</p>
        </div>
      </div>

      <!-- Accessibility & Inclusion Section -->
      <div style="background: #edf2f7; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #38a169;">
        <h3 style="color: #2d3748; font-size: 18px; margin: 0 0 12px 0;">🌟 Your Achievement Matters</h3>
        <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
          Your dedication to learning and skill development is inspiring. Every step forward in your training journey contributes to creating a more inclusive and accessible world.
        </p>
        <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0;">
          Share your accomplishment with your network! Your certificate demonstrates not just your skills, but your commitment to personal and professional growth.
        </p>
      </div>

      <!-- Call to Action -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${certificate.pdfUrl}" style="display: inline-block; background: linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%); color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3); transition: all 0.3s ease;">
          📄 Download Certificate (PDF)
        </a>
      </div>

      <!-- Verification Link -->
      <div style="text-align: center; margin: 20px 0;">
        <a href="${certificate.verificationUrl}" style="color: #3182ce; text-decoration: none; font-size: 14px; font-weight: 500;">
          🔍 Verify Certificate Online
        </a>
      </div>

      <!-- Training Details -->
      <div style="background: #f7fafc; border-radius: 6px; padding: 16px; margin: 24px 0; font-size: 13px; color: #718096;">
        <p style="margin: 0 0 4px 0;"><strong>Training:</strong> ${course.title}</p>
        <p style="margin: 0 0 4px 0;"><strong>Organization:</strong> ${orgName}</p>
        <p style="margin: 0 0 4px 0;"><strong>Issue Date:</strong> ${new Date(certificate.issueDate).toLocaleDateString()}</p>
        <p style="margin: 0;"><strong>Training ID:</strong> ${course._id}</p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
          Continue reaching for your goals and exploring new opportunities for growth. Your journey inspires others in our community!
        </p>
        
        <p style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">
          We wish you continued success in your learning journey!
        </p>
        
        <p style="color: #4a5568; font-size: 14px; margin: 0;">
          Your ${orgName} Training Team
        </p>
      </div>

      <!-- Support Notice -->
      <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 12px; margin-top: 24px; text-align: center;">
        <p style="color: #c53030; font-size: 12px; margin: 0;">
          This is an automatic email. For technical support or accessibility assistance, please contact our support team through your training portal.
        </p>
      </div>

    </div>
  `;
}; 