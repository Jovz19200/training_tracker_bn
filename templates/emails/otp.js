exports.getOtpTemplate = (userFirstName, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2F6C2C; text-align: center; margin-bottom: 30px;">OTP Verification - OTMS for OPDs</h2>
      <p style="color: #6a0dad; font-size: 16px;">Dear <strong>${userFirstName}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.5; color: #333;">You have initiated a request to sign in. Please use the One-Time Password (OTP) below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background-color: #2F6C2C; color: #ffffff; padding: 15px 30px; font-size: 28px; font-weight: bold; border-radius: 8px; letter-spacing: 3px;">
          ${otp}
        </div>
      </div>
      <p style="font-size: 14px; color: #777; text-align: center;">This OTP is valid for 10 minutes.</p>
      <p style="font-size: 14px; color: #777; text-align: center;">If you did not request this, please ignore this email.</p>
      <p style="font-size: 16px; color: #333; margin-top: 30px;">Best regards,<br>OTMS for OPDs Team</p>
    </div>
  `;
}; 