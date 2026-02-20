const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const serviceController = require('../controllers/serviceController');
const validate = require('../middleware/validation');

// Validation rules
const serviceValidation = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required'),
  body('icon').notEmpty().withMessage('Icon is required')
];

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getService);

// All routes are now public (authentication removed)
router.post('/', serviceValidation, validate, serviceController.createService);
router.patch('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);
router.post('/reorder', serviceController.reorderServices);

module.exports = router;