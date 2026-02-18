const Testimonial = require('../models/Testimonial');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getAllTestimonials = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  
  if (req.query.featured) {
    query.featured = req.query.featured === 'true';
  }

  const testimonials = await Testimonial.find(query)
    .sort('-featured -publishedAt')
    .skip(skip)
    .limit(limit)
    .populate('project', 'title slug');

  const total = await Testimonial.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: testimonials.length,
    data: {
      testimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
exports.getTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id)
    .populate('project', 'title slug');

  if (!testimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { testimonial }
  });
});

// @desc    Create new testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
exports.createTestimonial = catchAsync(async (req, res) => {
  const testimonial = await Testimonial.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { testimonial }
  });
});

// @desc    Update testimonial
// @route   PATCH /api/testimonials/:id
// @access  Private/Admin
exports.updateTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!testimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { testimonial }
  });
});

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
exports.deleteTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

  if (!testimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Toggle featured status
// @route   PATCH /api/testimonials/:id/toggle-featured
// @access  Private/Admin
exports.toggleFeatured = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  testimonial.featured = !testimonial.featured;
  await testimonial.save();

  res.status(200).json({
    status: 'success',
    data: { testimonial }
  });
});

// @desc    Upload testimonial avatar (store in MongoDB)
// @route   POST /api/testimonials/:id/avatar
// @access  Private/Admin
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  // Convert image to Base64
  const base64Image = req.file.buffer.toString('base64');

  testimonial.avatar = {
    data: base64Image,
    contentType: req.file.mimetype,
    filename: req.file.originalname,
    size: req.file.size
  };

  await testimonial.save();

  res.status(200).json({
    status: 'success',
    data: { 
      testimonial,
      avatarUrl: `/api/testimonials/${testimonial._id}/avatar`
    }
  });
});

// @desc    Get testimonial avatar
// @route   GET /api/testimonials/:id/avatar
// @access  Public
exports.getAvatar = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  if (!testimonial.avatar || !testimonial.avatar.data) {
    return next(new AppError('No avatar found', 404));
  }

  const imgBuffer = Buffer.from(testimonial.avatar.data, 'base64');
  
  res.set('Content-Type', testimonial.avatar.contentType);
  res.set('Cache-Control', 'public, max-age=31536000');
  res.send(imgBuffer);
});