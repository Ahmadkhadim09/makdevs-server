const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middleware/validation');

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.get('/verifyemail/:token', authController.verifyEmail);

// All routes are now public (authentication removed)
router.get('/logout', authController.logout);
router.get('/me', authController.getMe);
router.patch('/updatedetails', authController.updateDetails);
router.patch('/updatepassword', authController.updatePassword);

module.exports = router;