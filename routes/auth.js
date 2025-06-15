const express = require('express');
const { register, login, getMe, logout, verifyTwoFA, forgotPassword, resetPassword, verifyEmail, enable2FA, disable2FA } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify2fa', verifyTwoFA);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verifyemail/:verificationtoken', verifyEmail);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

// 2FA Management Routes
router.post('/enable2fa', protect, enable2FA);
router.post('/disable2fa', protect, disable2FA);

module.exports = router;