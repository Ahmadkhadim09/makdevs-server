const mongoose = require('mongoose');

// Define image schema first
const imageSchema = new mongoose.Schema({
  data: String, // Base64 encoded image
  contentType: String,
  filename: String,
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // Set _id to false to prevent creating subdocument IDs

// Main project schema
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true // Allows multiple documents without slug
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  fullDescription: {
    type: String,
    required: [true, 'Please provide full project description']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['web', 'mobile', 'ai', 'cloud', 'other']
  },
  // Updated images schema for MongoDB Atlas storage (without Cloudinary)
  images: [imageSchema],
  thumbnail: imageSchema,
  technologies: [{
    type: String,
    required: [true, 'Please provide technologies used']
  }],
  client: {
    name: String,
    website: String,
    industry: String
  },
  duration: String,
  team: [{
    name: String,
    role: String
  }],
  features: [String],
  challenges: String,
  solutions: String,
  results: String,
  liveUrl: String,
  githubUrl: String,
  caseStudy: String,
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title before saving
projectSchema.pre('save', function(next) {
  if (this.isModified('title') && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
  next();
});

// Virtual for image URLs (useful if you create endpoints to serve images)
projectSchema.virtual('imageUrls').get(function() {
  if (!this.images || this.images.length === 0) return [];
  
  return this.images.map((image, index) => ({
    id: index,
    filename: image.filename,
    url: `/api/projects/${this._id}/images/${index}`,
    thumbnail: index === 0 ? `/api/projects/${this._id}/images/${index}?thumbnail=true` : undefined
  }));
});

// Method to get image by index
projectSchema.methods.getImage = function(index) {
  if (!this.images || index >= this.images.length) return null;
  return this.images[index];
};

// Method to add image
projectSchema.methods.addImage = function(imageData) {
  if (!this.images) this.images = [];
  this.images.push(imageData);
  return this.images[this.images.length - 1];
};

// Method to remove image
projectSchema.methods.removeImage = function(index) {
  if (!this.images || index >= this.images.length) return false;
  this.images.splice(index, 1);
  return true;
};

// Index for better query performance
projectSchema.index({ slug: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ publishedAt: -1 });
projectSchema.index({ views: -1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;