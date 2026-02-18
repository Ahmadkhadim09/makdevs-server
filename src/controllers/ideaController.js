const Idea = require('../models/Idea');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const EmailService = require('../utils/emailService');

// @desc    Submit new idea
// @route   POST /api/ideas
// @access  Public
exports.submitIdea = catchAsync(async (req, res) => {
  const idea = await Idea.create({
    ...req.body,
    ip: req.ip
  });

  // Send notification to admin
  await EmailService.sendIdeaNotification(idea);

  // Send confirmation to user
  await EmailService.sendIdeaConfirmation(idea);

  res.status(201).json({
    status: 'success',
    message: 'Your idea has been submitted successfully! We will review it shortly.',
    data: { idea }
  });
});

// @desc    Get all ideas (Admin only)
// @route   GET /api/ideas
// @access  Private/Admin
exports.getAllIdeas = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by priority
  if (req.query.priority) {
    query.priority = req.query.priority;
  }

  // Search
  if (req.query.search) {
    query.$or = [
      { ideaTitle: { $regex: req.query.search, $options: 'i' } },
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const ideas = await Idea.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('reviewedBy', 'name email');

  const total = await Idea.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: ideas.length,
    data: {
      ideas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single idea
// @route   GET /api/ideas/:id
// @access  Private/Admin
exports.getIdea = catchAsync(async (req, res, next) => {
  const idea = await Idea.findById(req.params.id)
    .populate('reviewedBy', 'name email');

  if (!idea) {
    return next(new AppError('No idea found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { idea }
  });
});

// @desc    Review idea
// @route   PATCH /api/ideas/:id/review
// @access  Private/Admin
exports.reviewIdea = catchAsync(async (req, res, next) => {
  const idea = await Idea.findById(req.params.id);

  if (!idea) {
    return next(new AppError('No idea found with that ID', 404));
  }

  idea.status = req.body.status;
  idea.priority = req.body.priority || idea.priority;
  idea.reviewNotes = req.body.reviewNotes;
  idea.reviewedBy = req.user.id;
  idea.reviewedAt = Date.now();

  await idea.save();

  // Send email to user about review status
  await EmailService.sendIdeaReviewNotification(idea);

  res.status(200).json({
    status: 'success',
    data: { idea }
  });
});

// @desc    Delete idea
// @route   DELETE /api/ideas/:id
// @access  Private/Admin
exports.deleteIdea = catchAsync(async (req, res, next) => {
  const idea = await Idea.findByIdAndDelete(req.params.id);

  if (!idea) {
    return next(new AppError('No idea found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});