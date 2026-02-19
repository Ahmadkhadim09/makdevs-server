const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name too long'],
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  projectType: {
    type: String,
    required: [true, 'Project type is required'],
    enum: ['Web Application', 'Mobile App', 'E-commerce', 'AI/ML Solution', 'Cloud Migration', 'Other']
  },
  budget: {
    type: String,
    enum: ['Less than $10,000', '$10,000 - $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '$100,000+', ''],
    default: ''
  },
  timeline: {
    type: String,
    enum: ['ASAP', '1-3 months', '3-6 months', '6-12 months', 'Flexible', ''],
    default: ''
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  newsletter: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  notes: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for better query performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);