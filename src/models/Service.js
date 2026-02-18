const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: [true, 'Please provide an icon']
  },
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  fullDescription: {
    type: String,
    required: [true, 'Please provide full description']
  },
  features: [{
    title: String,
    description: String,
    icon: String
  }],
  technologies: [{
    name: String,
    icon: String,
    proficiency: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  image: {
    url: String,
    publicId: String
  },
  price: {
    starting: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  duration: String,
  deliverables: [String],
  process: [{
    step: Number,
    title: String,
    description: String
  }],
  caseStudies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  faq: [{
    question: String,
    answer: String
  }],
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);