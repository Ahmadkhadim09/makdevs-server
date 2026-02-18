const Team = require('../models/Team');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
exports.getAllTeam = catchAsync(async (req, res) => {
  const query = { active: true };
  
  if (req.query.featured) {
    query.featured = req.query.featured === 'true';
  }

  const team = await Team.find(query)
    .sort('-featured order');

  res.status(200).json({
    status: 'success',
    results: team.length,
    data: { team }
  });
});

// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Public
exports.getTeamMember = catchAsync(async (req, res, next) => {
  const member = await Team.findById(req.params.id);

  if (!member) {
    return next(new AppError('No team member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { member }
  });
});

// @desc    Create team member
// @route   POST /api/team
// @access  Private/Admin
exports.createTeamMember = catchAsync(async (req, res) => {
  const member = await Team.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { member }
  });
});

// @desc    Update team member
// @route   PATCH /api/team/:id
// @access  Private/Admin
exports.updateTeamMember = catchAsync(async (req, res, next) => {
  const member = await Team.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!member) {
    return next(new AppError('No team member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { member }
  });
});

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
exports.deleteTeamMember = catchAsync(async (req, res, next) => {
  const member = await Team.findByIdAndDelete(req.params.id);

  if (!member) {
    return next(new AppError('No team member found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Upload team member avatar (store in MongoDB)
// @route   POST /api/team/:id/avatar
// @access  Private/Admin
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  const member = await Team.findById(req.params.id);

  if (!member) {
    return next(new AppError('No team member found with that ID', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  // Convert image to Base64
  const base64Image = req.file.buffer.toString('base64');

  member.image = {
    data: base64Image,
    contentType: req.file.mimetype,
    filename: req.file.originalname,
    size: req.file.size
  };

  await member.save();

  res.status(200).json({
    status: 'success',
    data: { 
      member,
      imageUrl: `/api/team/${member._id}/avatar`
    }
  });
});

// @desc    Get team member avatar
// @route   GET /api/team/:id/avatar
// @access  Public
exports.getAvatar = catchAsync(async (req, res, next) => {
  const member = await Team.findById(req.params.id);

  if (!member) {
    return next(new AppError('No team member found with that ID', 404));
  }

  if (!member.image || !member.image.data) {
    return next(new AppError('No avatar found', 404));
  }

  const imgBuffer = Buffer.from(member.image.data, 'base64');
  
  res.set('Content-Type', member.image.contentType);
  res.set('Cache-Control', 'public, max-age=31536000');
  res.send(imgBuffer);
});