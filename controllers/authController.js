const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');
const { sendEmail, getOtpTemplate, getResetPasswordTemplate, getEmailVerificationTemplate } = require('../utils/notificationService');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, hasDisability, disabilityType, accessibilityNeeds, organization } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !organization) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password, and organization'
      });
    }

    // Verify organization exists
    const org = await Organization.findById(organization);
    if (!org) {
      return res.status(400).json({
        success: false,
        message: `Organization not found with id of ${organization}`
      });
    }

    // Create user with trainee role
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'trainee', // Force role to be trainee
      phone,
      hasDisability,
      disabilityType,
      accessibilityNeeds,
      organization
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL pointing to frontend, dynamically set based on environment
    const frontendBaseUrl = process.env.NODE_ENV === 'production'
      ? process.env.HOSTED_OTMS_FN_URL
      : process.env.FRONTEND_URL;
    const verificationURL = `${frontendBaseUrl}/verify-email?token=${verificationToken}`;

    const message = getEmailVerificationTemplate(user.firstName, verificationURL);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - OTMS for OPDs',
        message
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.'
      });
    } catch (err) {
      console.error(err);
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: 'Email verification could not be sent. Please try again later.'
      });
    }

  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address to log in.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If 2FA is enabled, send 2FA token
    if (user.twoFAStatus) {
      const twoFAToken = user.getTwoFAToken();
      await user.save({ validateBeforeSave: false });

      const message = getOtpTemplate(user.firstName, twoFAToken);

      try {
        await sendEmail({
          email: user.email,
          subject: 'Your 2FA Token - OTMS for OPDs',
          message
        });

        return res.status(200).json({
          success: true,
          message: '2FA token sent to your email',
          twoFARequired: true,
          userId: user._id
        });
      } catch (err) {
        user.twoFAToken = undefined;
        user.twoFATokenExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({
          success: false,
          message: 'Email could not be sent. Please try again later.'
        });
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verifyemail/:verificationtoken
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    // Get hashed token
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.verificationtoken)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Set user as verified and clear token fields
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Redirect to frontend with token or success message
    sendTokenResponse(user, 200, res);
    
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Verify 2FA token
// @route   POST /api/auth/verify2fa
// @access  Public
exports.verifyTwoFA = async (req, res) => {
  try {
    const { email, twoFAToken } = req.body;

    if (!email || !twoFAToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and 2FA token'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token or email'
      });
    }

    // Check if token matches and is not expired
    if (user.twoFAToken !== twoFAToken || user.twoFATokenExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired 2FA token'
      });
    }

    // Clear 2FA token fields
    user.twoFAToken = undefined;
    user.twoFATokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const frontendBaseUrl = process.env.NODE_ENV === 'production'
      ? process.env.HOSTED_OTMS_FN_URL
      : process.env.FRONTEND_URL;
    const resetURL = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

    const message = getResetPasswordTemplate(user.firstName, resetURL);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token - OTMS for OPDs',
        message
      });

      res.status(200).json({
        success: true,
        data: 'Email sent'
      });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password, resetToken } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reset token and a new password'
      });
    }

    // Get hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
};

// @desc    Enable 2FA for user (Admin only)
// @route   POST /api/auth/enable2fa
// @access  Private/Admin
exports.enable2FA = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can manage 2FA settings'
      });
    }

    // Get target user ID from request body, default to admin's ID if not provided
    const targetUserId = req.body.userId || req.user.id;
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Enable 2FA directly
    user.twoFAStatus = true;
    // Clear any lingering 2FA token fields if they exist
    user.twoFAToken = undefined;
    user.twoFATokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // Prepare and send informational email
    const subject = '2FA Status Updated - OTMS for OPDs';
    const message = `Dear ${user.firstName},<br><br>Two-Factor Authentication (2FA) has been enabled for your account.<br><br>If you did not make this change, please contact support immediately.<br><br>Best regards,<br>OTMS for OPDs Team`;

    try {
      await sendEmail({
        email: user.email,
        subject: subject,
        message: message
      });

      res.status(200).json({
        success: true,
        message: '2FA has been enabled for the account. An email notification has been sent.'
      });
    } catch (err) {
      // If email fails, 2FA status is already updated, but we log the email error
      console.error(`Error sending 2FA enablement notification email to ${user.email}: ${err.message}`);
      res.status(500).json({
        success: false,
        message: '2FA has been enabled, but email notification could not be sent. Please try again later or contact support.'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Disable 2FA for user (Admin only)
// @route   POST /api/auth/disable2fa
// @access  Private/Admin
exports.disable2FA = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can manage 2FA settings'
      });
    }

    const { userId } = req.body;

    // Get target user ID from request body, default to admin's ID if not provided
    const targetUserId = userId || req.user.id;
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Disable 2FA directly
    user.twoFAStatus = false;
    // Clear any lingering 2FA token fields if they exist
    user.twoFAToken = undefined;
    user.twoFATokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // Prepare and send informational email
    const subject = '2FA Status Updated - OTMS for OPDs';
    const message = `Dear ${user.firstName},<br><br>Two-Factor Authentication (2FA) has been disabled for your account.<br><br>If you did not make this change, please contact support immediately.<br><br>Best regards,<br>OTMS for OPDs Team`;

    try {
      await sendEmail({
        email: user.email,
        subject: subject,
        message: message
      });

      res.status(200).json({
        success: true,
        message: '2FA has been disabled for the account. An email notification has been sent.'
      });
    } catch (err) {
      // If email fails, 2FA status is already updated, but we log the email error
      console.error(`Error sending 2FA disablement notification email to ${user.email}: ${err.message}`);
      res.status(500).json({
        success: false,
        message: '2FA has been disabled, but email notification could not be sent. Please try again later or contact support.'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};