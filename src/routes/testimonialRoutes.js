const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const testimonialController = require('../controllers/testimonialController');
const validate = require('../middleware/validation');
const upload = require('../middleware/upload'); // ← Missing this import!

// Validation rules
const testimonialValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('company').notEmpty().withMessage('Company is required'),
  body('content').notEmpty().withMessage('Content is required').isLength({ max: 500 }),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

// Public routes
router.get('/', testimonialController.getAllTestimonials);
router.get('/:id', testimonialController.getTestimonial);
router.get('/:id/avatar', testimonialController.getAvatar);

// All routes are now public (authentication removed)
router.post('/', testimonialValidation, validate, testimonialController.createTestimonial);
router.post('/:id/avatar', upload.single('avatar'), testimonialController.uploadAvatar);
router.patch('/:id', testimonialController.updateTestimonial);
router.delete('/:id', testimonialController.deleteTestimonial);
router.patch('/:id/toggle-featured', testimonialController.toggleFeatured);

module.exports = router;