const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ideaController = require('../controllers/ideaController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation rules
const ideaValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('ideaTitle').notEmpty().withMessage('Idea title is required').isLength({ max: 100 }),
  body('ideaDescription').notEmpty().withMessage('Idea description is required').isLength({ max: 5000 }),
  body('industry').notEmpty().withMessage('Industry is required')
];

// Public routes
router.post('/', ideaValidation, validate, ideaController.submitIdea);

// Protected routes (Admin only)
router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

router.route('/')
  .get(ideaController.getAllIdeas);

router.route('/:id')
  .get(ideaController.getIdea)
  .delete(ideaController.deleteIdea);

router.patch('/:id/review', ideaController.reviewIdea);

module.exports = router;