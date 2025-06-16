exports.getResetPasswordTemplate = (userFirstName, resetURL) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2F6C2C; text-align: center; margin-bottom: 30px;">Password Reset Request - OTMS for OPDs</h2>
      <p style="color: #6a0dad; font-size: 16px;">Dear <strong>${userFirstName}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.5; color: #333;">You are receiving this because you (or someone else) has requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" style="display: inline-block; background-color: #2F6C2C; color: #ffffff; padding: 12px 25px; font-size: 16px; font-weight: bold; border-radius: 5px; text-decoration: none;">Reset Password</a>
      </p>
      <p style="font-size: 16px; line-height: 1.5; color: #333;">This link is valid for 10 minutes.</p>
      <p style="font-size: 14px; color: #777;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p style="font-size: 16px; color: #333; margin-top: 30px;">Best regards,<br>OTMS for OPDs Team</p>
    </div>
  `;
}; 