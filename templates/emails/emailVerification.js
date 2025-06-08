exports.getEmailVerificationTemplate = (userFirstName, verificationURL) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2F6C2C; text-align: center; margin-bottom: 30px;">Email Verification - OTMS for OPDs</h2>
      <p style="color: #6a0dad; font-size: 16px;">Dear <strong>${userFirstName}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.5; color: #333;">Thank you for registering! Please verify your email address by clicking the link below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verificationURL}" style="display: inline-block; background-color: #2F6C2C; color: #ffffff; padding: 12px 25px; font-size: 16px; font-weight: bold; border-radius: 5px; text-decoration: none;">Verify Email</a>
      </p>
      <p style="font-size: 16px; line-height: 1.5; color: #333;">This link is valid for 24 hours.</p>
      <p style="font-size: 14px; color: #777;">If you did not register for this service, please ignore this email.</p>
      <p style="font-size: 16px; color: #333; margin-top: 30px;">Best regards,<br>OTMS for OPDs Team</p>
    </div>
  `;
}; 