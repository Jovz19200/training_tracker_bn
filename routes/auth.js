const express = require('express');
const passport = require('passport');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

// Google OAuth routes
router.get('/google',
  (req, res, next) => {
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      session: false,
      prompt: 'select_account'
    })(req, res, next);
  }
);

router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
      session: false 
    })(req, res, next);
  },
  (req, res) => {
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
  }
);

module.exports = router;