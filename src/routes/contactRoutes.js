const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation rules
const contactValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('projectType').notEmpty().withMessage('Project type is required'),
  body('message').notEmpty().withMessage('Message is required').isLength({ max: 2000 })
];

// Public routes
router.post('/', contactValidation, validate, contactController.submitContact);

// Protected routes (Admin only)
router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

router.route('/')
  .get(contactController.getAllContacts);

router.route('/:id')
  .get(contactController.getContact)
  .patch(contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;