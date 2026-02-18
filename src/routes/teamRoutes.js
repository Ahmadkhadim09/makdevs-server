const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validation');
// Add these routes after the existing ones

const teamValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('role').notEmpty().withMessage('Role is required'),
  body('bio').notEmpty().withMessage('Bio is required').isLength({ max: 500 })
];

// Public routes
router.get('/', teamController.getAllTeam);
router.get('/:id', teamController.getTeamMember);

// Protected routes (Admin only)
router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

router.post('/', teamValidation, validate, teamController.createTeamMember);
router.patch('/:id', teamController.updateTeamMember);
router.delete('/:id', teamController.deleteTeamMember);
router.post('/:id/avatar', upload.single('avatar'), teamController.uploadAvatar);
// Add these routes after the existing ones
router.get('/:id/avatar', teamController.getAvatar);
router.post('/:id/avatar', upload.single('avatar'), teamController.uploadAvatar);
module.exports = router;