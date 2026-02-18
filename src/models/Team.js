const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide team member name'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Please provide role'],
    trim: true
  },
  bio: {
    type: String,
    required: [true, 'Please provide bio'],
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  fullBio: String,
  // Replace the image field with this:
image: {
  data: String, // Base64 encoded image
  contentType: String,
  filename: String,
  size: Number
},
  email: String,
  phone: String,
  expertise: [String],
  skills: [{
    name: String,
    level: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  social: {
    linkedin: String,
    twitter: String,
    github: String,
    portfolio: String
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: [{
    position: String,
    company: String,
    years: String,
    description: String
  }],
  achievements: [String],
  order: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);