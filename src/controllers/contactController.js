const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const EmailService = require('../utils/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = catchAsync(async (req, res) => {
  const contact = await Contact.create({
    ...req.body,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // If user opted for newsletter, add to newsletter list
  if (req.body.newsletter) {
    await Newsletter.findOneAndUpdate(
      { email: req.body.email },
      { email: req.body.email, name: req.body.name },
      { upsert: true, new: true }
    );
  }

  // Send email notification to admin
  await EmailService.sendContactNotification(contact);

  // Send auto-reply to user
  await EmailService.sendContactAutoReply(contact);

  res.status(201).json({
    status: 'success',
    message: 'Thank you for contacting us. We will get back to you soon!',
    data: { contact }
  });
});

// @desc    Get all contacts (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllContacts = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Search by name or email
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const contacts = await Contact.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('assignedTo', 'name email');

  const total = await Contact.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: contacts.length,
    data: {
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id)
    .populate('assignedTo', 'name email');

  if (!contact) {
    return next(new AppError('No contact found with that ID', 404));
  }

  // Mark as read if not already
  if (contact.status === 'new') {
    contact.status = 'read';
    await contact.save();
  }

  res.status(200).json({
    status: 'success',
    data: { contact }
  });
});

// @desc    Update contact status
// @route   PATCH /api/contact/:id
// @access  Private/Admin
exports.updateContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      notes: req.body.notes,
      assignedTo: req.body.assignedTo
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!contact) {
    return next(new AppError('No contact found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { contact }
  });
});

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return next(new AppError('No contact found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});