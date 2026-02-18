const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
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
  ideaTitle: {
    type: String,
    required: [true, 'Please provide an idea title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  ideaDescription: {
    type: String,
    required: [true, 'Please describe your idea'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  industry: {
    type: String,
    required: [true, 'Please select an industry'],
    enum: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Other']
  },
  attachments: [{
    url: String,
    publicId: String,
    filename: String
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected', 'implemented'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  reviewNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  isConfidential: {
    type: Boolean,
    default: true
  },
  ip: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Idea', ideaSchema);