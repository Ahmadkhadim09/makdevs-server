module.exports = {
  // JWT settings
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Password settings
  passwordMinLength: 8,
  passwordMaxLength: 30,
  
  // Rate limiting
  maxLoginAttempts: 5,
  lockTime: 30 * 60 * 1000, // 30 minutes
  
  // Email verification
  emailVerificationExpire: 24 * 60 * 60 * 1000, // 24 hours
  passwordResetExpire: 10 * 60 * 1000 // 10 minutes
};