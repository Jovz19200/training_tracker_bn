const passport = require('passport');

// @desc    Initiate Google OAuth login
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = (req, res, next) => {
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account'
  })(req, res, next);
};

// @desc    Handle Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
    session: false 
  })(req, res, next);
};

// @desc    Handle successful Google authentication
// @route   GET /api/auth/google/callback
// @access  Public
exports.handleGoogleSuccess = (req, res) => {
  try {
    if (!req.user) {
      throw new Error('No user found after Google authentication');
    }

    // Generate JWT token
    const token = req.user.getSignedJwtToken();
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  } catch (error) {
    console.error('Google auth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
  }
}; 