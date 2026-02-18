const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const newsletterController = require('../controllers/newsletterController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation rules
const subscribeValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail()
];

// Public routes
router.post('/subscribe', subscribeValidation, validate, newsletterController.subscribe);
router.post('/unsubscribe', subscribeValidation, validate, newsletterController.unsubscribe);

// Protected routes (Admin only)
router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

router.get('/', newsletterController.getAllSubscribers);
router.get('/export', newsletterController.exportSubscribers);
router.patch('/:id', newsletterController.updatePreferences);
router.delete('/:id', newsletterController.deleteSubscriber);

module.exports = router;