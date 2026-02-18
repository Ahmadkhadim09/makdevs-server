const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getAllProjects = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by featured
  if (req.query.featured) {
    query.featured = req.query.featured === 'true';
  }

  // Search by title
  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: 'i' };
  }

  const projects = await Project.find(query)
    .sort('-featured -publishedAt')
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name');

  const total = await Project.countDocuments(query);

  // Don't send image data in list view (to keep response small)
  const projectsWithoutImages = projects.map(project => {
    const projectObj = project.toObject();
    // Remove image data from response
    if (projectObj.images) {
      projectObj.images = projectObj.images.map((img, index) => ({
        id: index,
        filename: img.filename,
        contentType: img.contentType,
        size: img.size,
        url: `/api/projects/${project._id}/images/${index}`
      }));
    }
    return projectObj;
  });

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: {
      projects: projectsWithoutImages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single project by slug
// @route   GET /api/projects/:slug
// @access  Public
exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findOne({ slug: req.params.slug })
    .populate('createdBy', 'name');

  if (!project) {
    return next(new AppError('No project found with that slug', 404));
  }

  // Increment views
  project.views += 1;
  await project.save();

  // Create image URLs without sending the actual image data
  const projectObj = project.toObject();
  if (projectObj.images) {
    projectObj.images = projectObj.images.map((img, index) => ({
      id: index,
      filename: img.filename,
      contentType: img.contentType,
      size: img.size,
      url: `/api/projects/${project._id}/images/${index}`
    }));
  }

  res.status(200).json({
    status: 'success',
    data: { project: projectObj }
  });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = catchAsync(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    createdBy: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: { project }
  });
});

// @desc    Update project
// @route   PATCH /api/projects/:id
// @access  Private/Admin
exports.updateProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { project }
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Upload project images (store in MongoDB)
// @route   POST /api/projects/:id/images
// @access  Private/Admin
exports.uploadImages = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  const images = [];
  
  for (const file of req.files) {
    // Convert image to Base64
    const base64Image = file.buffer.toString('base64');
    
    const imageData = {
      data: base64Image,
      contentType: file.mimetype,
      filename: file.originalname,
      size: file.size,
      uploadedAt: new Date()
    };

    project.images.push(imageData);
    images.push(imageData);
  }

  await project.save();

  // Return image info (without the base64 data)
  const responseImages = images.map((img, index) => ({
    id: project.images.length - images.length + index,
    filename: img.filename,
    size: img.size,
    contentType: img.contentType,
    url: `/api/projects/${project._id}/images/${project.images.length - images.length + index}`
  }));

  res.status(200).json({
    status: 'success',
    message: `${images.length} image(s) uploaded successfully`,
    data: { 
      images: responseImages,
      totalImages: project.images.length
    }
  });
});

// @desc    Get project image
// @route   GET /api/projects/:projectId/images/:imageIndex
// @access  Public
exports.getImage = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);
  
  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  const imageIndex = parseInt(req.params.imageIndex);
  
  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= project.images.length) {
    return next(new AppError('Invalid image index', 400));
  }

  const image = project.images[imageIndex];
  
  if (!image || !image.data) {
    return next(new AppError('Image not found', 404));
  }

  // Convert Base64 back to buffer
  const imgBuffer = Buffer.from(image.data, 'base64');
  
  // Set appropriate headers
  res.set('Content-Type', image.contentType);
  res.set('Content-Length', image.size.toString());
  res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  res.set('Content-Disposition', `inline; filename="${image.filename}"`);
  
  res.send(imgBuffer);
});

// @desc    Delete project image
// @route   DELETE /api/projects/:projectId/images/:imageIndex
// @access  Private/Admin
exports.deleteImage = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);
  
  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  const imageIndex = parseInt(req.params.imageIndex);
  
  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= project.images.length) {
    return next(new AppError('Invalid image index', 400));
  }

  // Remove image from array
  project.images.splice(imageIndex, 1);
  await project.save();

  res.status(200).json({
    status: 'success',
    message: 'Image deleted successfully',
    data: { 
      remainingImages: project.images.length 
    }
  });
});