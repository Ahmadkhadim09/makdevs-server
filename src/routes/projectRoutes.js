const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validation');

// Validation rules
const projectValidation = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('technologies').isArray().withMessage('Technologies must be an array')
];
// Add these routes for image handling
router.get('/:projectId/images/:imageIndex', projectController.getImage);
router.delete('/:projectId/images/:imageIndex', 
  authMiddleware.protect, 
  authMiddleware.restrictTo('admin'), 
  projectController.deleteImage
);
// Public routes
router.get('/', projectController.getAllProjects);
router.get('/:slug', projectController.getProject);

// Protected routes (Admin only)
router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

router.post('/', projectValidation, validate, projectController.createProject);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/images', upload.array('images', 10), projectController.uploadImages);

module.exports = router;