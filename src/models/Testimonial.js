const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide client name'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Please provide company name']
  },
  position: String,
 // Replace the avatar field with this:
avatar: {
  data: String, // Base64 encoded image
  contentType: String,
  filename: String,
  size: Number
},
  content: {
    type: String,
    required: [true, 'Please provide testimonial content'],
    maxlength: [500, 'Content cannot be more than 500 characters']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  videoUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);