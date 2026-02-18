const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
const User = require('../models/User');
const Project = require('../models/Project');
const Service = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const Team = require('../models/Team');

// Sample data
const sampleServices = [
  {
    icon: '💻',
    title: 'Web Development',
    description: 'Custom web applications built with modern technologies',
    fullDescription: 'We build scalable, high-performance web applications using cutting-edge technologies...',
    features: [
      { title: 'Responsive Design', description: 'Mobile-first approach', icon: '📱' },
      { title: 'Performance', description: 'Optimized for speed', icon: '⚡' }
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'Python']
  },
  {
    icon: '📱',
    title: 'Mobile Apps',
    description: 'Native and cross-platform mobile applications',
    fullDescription: 'We create engaging mobile experiences for iOS and Android...',
    features: [
      { title: 'Native Performance', description: 'Smooth, native-like experience', icon: '🚀' },
      { title: 'Offline Support', description: 'Work without internet', icon: '📴' }
    ],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin']
  }
];

const sampleTeam = [
  {
    name: 'John Doe',
    role: 'Founder & CEO',
    bio: '10+ years of experience in software development',
    expertise: ['Leadership', 'Strategy', 'Full Stack'],
    featured: true
  },
  {
    name: 'Jane Smith',
    role: 'Lead Developer',
    bio: 'Full-stack developer specializing in React and Node.js',
    expertise: ['React', 'Node.js', 'MongoDB'],
    featured: true
  }
];

const sampleTestimonials = [
  {
    name: 'Mike Johnson',
    company: 'TechCorp',
    content: 'MAKDEVS delivered an exceptional product that exceeded our expectations!',
    rating: 5
  },
  {
    name: 'Sarah Williams',
    company: 'StartUp Inc',
    content: 'Professional team, excellent communication, and outstanding technical skills.',
    rating: 5
  }
];

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Database connected'));

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Service.deleteMany();
    await Team.deleteMany();
    await Testimonial.deleteMany();
    
    console.log('📦 Existing data cleared');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@makdevs.com',
      password: 'admin123456',
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Admin user created');

    // Seed services
    await Service.insertMany(sampleServices);
    console.log('✅ Services seeded');

    // Seed team
    await Team.insertMany(sampleTeam);
    console.log('✅ Team seeded');

    // Seed testimonials
    await Testimonial.insertMany(sampleTestimonials);
    console.log('✅ Testimonials seeded');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();