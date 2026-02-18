const Newsletter = require('../models/Newsletter');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const EmailService = require('../utils/emailService');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = catchAsync(async (req, res) => {
  const { email, name, preferences } = req.body;

  // Check if already subscribed
  let subscriber = await Newsletter.findOne({ email });

  if (subscriber) {
    if (subscriber.status === 'active') {
      return res.status(200).json({
        status: 'success',
        message: 'You are already subscribed to our newsletter!'
      });
    } else {
      // Reactivate subscription
      subscriber.status = 'active';
      subscriber.subscribedAt = Date.now();
      subscriber.preferences = preferences || subscriber.preferences;
      await subscriber.save();

      return res.status(200).json({
        status: 'success',
        message: 'Your subscription has been reactivated!'
      });
    }
  }

  // Create new subscriber
  subscriber = await Newsletter.create({
    email,
    name,
    preferences,
    ip: req.ip
  });

  // Send welcome email
  await EmailService.sendNewsletterWelcome(subscriber);

  res.status(201).json({
    status: 'success',
    message: 'Successfully subscribed to newsletter!',
    data: { subscriber }
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = catchAsync(async (req, res) => {
  const { email } = req.body;

  const subscriber = await Newsletter.findOne({ email });

  if (!subscriber) {
    return res.status(404).json({
      status: 'fail',
      message: 'Email not found in our newsletter list'
    });
  }

  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = Date.now();
  await subscriber.save();

  res.status(200).json({
    status: 'success',
    message: 'Successfully unsubscribed from newsletter'
  });
});

// @desc    Get all subscribers (Admin only)
// @route   GET /api/newsletter
// @access  Private/Admin
exports.getAllSubscribers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Search by email or name
  if (req.query.search) {
    query.$or = [
      { email: { $regex: req.query.search, $options: 'i' } },
      { name: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const subscribers = await Newsletter.find(query)
    .sort('-subscribedAt')
    .skip(skip)
    .limit(limit);

  const total = await Newsletter.countDocuments(query);

  // Get statistics
  const stats = await Newsletter.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: subscribers.length,
    data: {
      subscribers,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Delete subscriber
// @route   DELETE /api/newsletter/:id
// @access  Private/Admin
exports.deleteSubscriber = catchAsync(async (req, res, next) => {
  const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

  if (!subscriber) {
    return next(new AppError('No subscriber found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Update subscriber preferences
// @route   PATCH /api/newsletter/:id
// @access  Private/Admin
exports.updatePreferences = catchAsync(async (req, res, next) => {
  const subscriber = await Newsletter.findByIdAndUpdate(
    req.params.id,
    {
      preferences: req.body.preferences,
      name: req.body.name
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!subscriber) {
    return next(new AppError('No subscriber found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { subscriber }
  });
});

// @desc    Export subscribers to CSV
// @route   GET /api/newsletter/export
// @access  Private/Admin
exports.exportSubscribers = catchAsync(async (req, res) => {
  const subscribers = await Newsletter.find({ status: 'active' })
    .sort('-subscribedAt');

  const csv = [
    ['Email', 'Name', 'Subscribed At', 'Status', 'Frequency'].join(','),
    ...subscribers.map(sub => [
      sub.email,
      sub.name || '',
      sub.subscribedAt.toISOString(),
      sub.status,
      sub.preferences?.frequency || 'weekly'
    ].join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');
  res.status(200).send(csv);
});