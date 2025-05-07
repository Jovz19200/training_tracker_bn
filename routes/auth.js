const express = require('express');
const passport = require('passport');
const { register, login, getMe, logout } = require('../controllers/authController');
const { googleAuth, googleCallback, handleGoogleSuccess } = require('../controllers/googleAuthController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback, handleGoogleSuccess);

module.exports = router;