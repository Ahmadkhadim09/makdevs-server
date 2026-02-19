const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = catchAsync(async (req, res) => {
  console.log('📝 Contact form submission received:', {
    name: req.body.name,
    email: req.body.email,
    projectType: req.body.projectType
  });

  // Create contact entry
  const contact = await Contact.create({
    name: req.body.name,
    email: req.body.email,
    company: req.body.company || '',
    phone: req.body.phone || '',
    projectType: req.body.projectType,
    budget: req.body.budget || '',
    timeline: req.body.timeline || '',
    message: req.body.message,
    newsletter: req.body.newsletter || false,
    status: 'new',
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent') || ''
  });

  console.log('✅ Contact saved with ID:', contact._id);

  // If user opted for newsletter, add to newsletter list
  if (req.body.newsletter) {
    try {
      await Newsletter.findOneAndUpdate(
        { email: req.body.email },
        { 
          email: req.body.email, 
          name: req.body.name,
          subscribedAt: new Date(),
          status: 'active'
        },
        { upsert: true, new: true }
      );
      console.log('✅ Added to newsletter:', req.body.email);
    } catch (newsletterError) {
      console.error('Newsletter subscription error:', newsletterError);
      // Don't fail the main request if newsletter fails
    }
  }

  // Send success response
  res.status(201).json({
    status: 'success',
    message: 'Thank you for contacting us! We will get back to you within 24 hours.',
    data: {
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        projectType: contact.projectType,
        createdAt: contact.createdAt
      }
    }
  });
});

// @desc    Get all contacts (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllContacts = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query
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

  // Date range filter
  if (req.query.startDate && req.query.endDate) {
    query.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  const contacts = await Contact.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Contact.countDocuments(query);

  // Get statistics
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: contacts.length,
    data: {
      contacts,
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

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('No contact found with that ID', 404));
  }

  // Mark as read if it was new
  if (contact.status === 'new') {
    contact.status = 'read';
    contact.readAt = Date.now();
    await contact.save();
  }

  res.status(200).json({
    status: 'success',
    data: { contact }
  });
});

// @desc    Update contact
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

// @desc    Update contact status only
// @route   PATCH /api/contact/:id/status
// @access  Private/Admin
exports.updateContactStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  if (!['new', 'read', 'replied', 'archived'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
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