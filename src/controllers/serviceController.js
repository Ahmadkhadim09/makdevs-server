const Service = require('../models/Service');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getAllServices = catchAsync(async (req, res) => {
  const query = { active: true };
  
  if (req.query.featured) {
    // For public, show all active services
  }

  const services = await Service.find(query)
    .sort('order')
    .populate('caseStudies');

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: { services }
  });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id)
    .populate('caseStudies');

  if (!service) {
    return next(new AppError('No service found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { service }
  });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
exports.createService = catchAsync(async (req, res) => {
  const service = await Service.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { service }
  });
});

// @desc    Update service
// @route   PATCH /api/services/:id
// @access  Private/Admin
exports.updateService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!service) {
    return next(new AppError('No service found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { service }
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndDelete(req.params.id);

  if (!service) {
    return next(new AppError('No service found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Reorder services
// @route   POST /api/services/reorder
// @access  Private/Admin
exports.reorderServices = catchAsync(async (req, res) => {
  const { orders } = req.body;

  for (const item of orders) {
    await Service.findByIdAndUpdate(item.id, { order: item.order });
  }

  res.status(200).json({
    status: 'success',
    message: 'Services reordered successfully'
  });
});