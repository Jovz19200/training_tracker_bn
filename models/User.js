const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [50, 'First name can not be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [50, 'Last name can not be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  twoFAStatus: {
    type: Boolean,
    default: true
  },
  twoFAToken: String,
  twoFATokenExpire: Date,
  role: {
    type: String,
    enum: ['trainee', 'trainer', 'manager', 'admin'],
    default: 'trainee'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  phone: {
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters']
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  hasDisability: {
    type: Boolean,
    default: false
  },
  disabilityType: {
    type: String,
    enum: ['visual', 'hearing', 'physical', 'cognitive', 'other', 'none'],
    default: 'none'
  },
  accessibilityNeeds: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash 2FA token
UserSchema.methods.getTwoFAToken = function() {
  // Generate token
  const twoFAToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number

  // Set to twoFAToken field
  this.twoFAToken = twoFAToken;

  // Set expire
  this.twoFATokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return twoFAToken;
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
UserSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

module.exports = mongoose.model('User', UserSchema);