const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  company: String,
  phone: String,
  projectType: {
    type: String,
    required: [true, 'Please select project type'],
    enum: ['Web Application', 'Mobile App', 'E-commerce', 'AI/ML Solution', 'Cloud Migration', 'Other']
  },
  budget: {
    type: String,
    enum: ['Less than $10,000', '$10,000 - $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '$100,000+']
  },
  timeline: {
    type: String,
    enum: ['ASAP', '1-3 months', '3-6 months', '6-12 months', 'Flexible']
  },
  message: {
    type: String,
    required: [true, 'Please tell us about your project'],
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
  notes: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ip: String,
  userAgent: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);