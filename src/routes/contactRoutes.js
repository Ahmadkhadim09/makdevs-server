const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const validate = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiting for contact form (prevent spam)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per IP per hour
  message: {
    status: 'error',
    message: 'Too many contact submissions. Please try again later.'
  }
});

// Validation rules
const contactValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .toLowerCase(),
  
  body('company')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 }).withMessage('Company name too long'),
  
  body('projectType')
    .notEmpty().withMessage('Project type is required')
    .isIn(['Web Application', 'Mobile App', 'E-commerce', 'AI/ML Solution', 'Cloud Migration', 'Other'])
    .withMessage('Invalid project type'),
  
  body('budget')
    .optional()
    .isIn(['Less than $10,000', '$10,000 - $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '$100,000+'])
    .withMessage('Invalid budget range'),
  
  body('timeline')
    .optional()
    .isIn(['ASAP', '1-3 months', '3-6 months', '6-12 months', 'Flexible'])
    .withMessage('Invalid timeline'),
  
  body('message')
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
    .trim()
    .escape(),
  
  body('newsletter')
    .optional()
    .isBoolean().withMessage('Invalid newsletter value')
];

// ✅ PUBLIC ROUTE - No authentication required
router.post(
  '/', 
  contactLimiter, // Apply rate limiting
  contactValidation, 
  validate, 
  contactController.submitContact
);

// All routes are now public (authentication removed)
router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContact);
router.patch('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);
router.patch('/:id/status', contactController.updateContactStatus);

module.exports = router;