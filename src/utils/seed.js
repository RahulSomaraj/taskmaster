const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const dayjs = require('dayjs');
require('dotenv').config();

const categories = ['work', 'personal', 'health', 'finance', 'education', 'shopping', 'travel', 'other'];
const priorities = ['low', 'medium', 'high'];
const statuses = ['pending', 'completed', 'cancelled'];

const sampleTasks = [
  'Complete project presentation',
  'Review quarterly reports',
  'Schedule team meeting',
  'Update documentation',
  'Code review for feature branch',
  'Prepare budget proposal',
  'Client consultation call',
  'Database optimization',
  'Security audit review',
  'Deploy to production',
  'Grocery shopping',
  'Pay utility bills',
  'Book dentist appointment',
  'Plan weekend trip',
  'Clean apartment',
  'Laundry day',
  'Call mom',
  'Buy birthday gift',
  'Organize closet',
  'Meal prep for week',
  'Morning workout',
  'Evening walk',
  'Meditation session',
  'Read 30 minutes',
  'Drink 8 glasses of water',
  'Take vitamins',
  'Stretch exercises',
  'Yoga class',
  'Check blood pressure',
  'Schedule annual checkup',
  'Review investment portfolio',
  'Pay credit card bill',
  'Update insurance policy',
  'Research new savings account',
  'File tax documents',
  'Budget review',
  'Emergency fund contribution',
  'Retirement plan review',
  'Complete online course module',
  'Practice coding problems',
  'Read technical article',
  'Watch tutorial video',
  'Join study group',
  'Prepare for certification exam',
  'Research new technology',
  'Attend webinar',
  'Update resume',
  'Network event',
  'Buy new laptop',
  'Purchase office supplies',
  'Order business cards',
  'Get printer ink',
  'Buy conference tickets',
  'Reserve hotel room',
  'Book flight tickets',
  'Plan itinerary',
  'Pack luggage',
  'Check travel documents',
  'Research local attractions',
  'Book restaurant reservations',
  'Arrange airport transfer'
];

const sampleDescriptions = [
  'Important task that needs attention',
  'High priority item for this week',
  'Regular maintenance task',
  'Follow up required',
  'Needs coordination with team',
  'Requires research and planning',
  'Quick task that can be done today',
  'Long-term project milestone',
  'Daily routine task',
  'Weekly review item'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomTime() {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function getRandomTags() {
  const allTags = ['urgent', 'important', 'follow-up', 'meeting', 'deadline', 'review', 'planning', 'research', 'maintenance', 'creative'];
  const numTags = Math.floor(Math.random() * 4);
  const tags = [];
  
  for (let i = 0; i < numTags; i++) {
    const tag = getRandomElement(allTags);
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return tags;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create demo user
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@demo.com',
      password: 'Demo@123',
      role: 'user'
    });

    await demoUser.save();
    console.log('👤 Created demo user');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'Admin@123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('👑 Created admin user');

    // Generate tasks for the last 90 days
    const endDate = dayjs();
    const startDate = endDate.subtract(90, 'days');
    
    const tasks = [];
    const numTasks = 500; // Generate 500 random tasks

    for (let i = 0; i < numTasks; i++) {
      const taskDate = getRandomDate(startDate.toDate(), endDate.toDate());
      const status = getRandomElement(statuses);
      const completedAt = status === 'completed' ? getRandomDate(taskDate, endDate.toDate()) : null;
      
      const task = {
        userId: Math.random() > 0.8 ? adminUser._id : demoUser._id, // 20% chance for admin user
        title: getRandomElement(sampleTasks),
        description: Math.random() > 0.7 ? getRandomElement(sampleDescriptions) : '',
        date: taskDate,
        dueTime: Math.random() > 0.6 ? getRandomTime() : null,
        status: status,
        priority: getRandomElement(priorities),
        category: getRandomElement(categories),
        tags: getRandomTags(),
        estimatedMinutes: Math.random() > 0.5 ? Math.floor(Math.random() * 180) + 15 : null, // 15-195 minutes
        completedAt: completedAt,
        createdAt: getRandomDate(taskDate, endDate.toDate())
      };

      tasks.push(task);
    }

    // Insert tasks in batches
    const batchSize = 100;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      await Task.insertMany(batch);
      console.log(`📝 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tasks.length / batchSize)}`);
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Demo Data Summary:');
    console.log(`👤 Users: 2 (demo@demo.com, admin@demo.com)`);
    console.log(`📝 Tasks: ${tasks.length}`);
    console.log(`📅 Date Range: ${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}`);
    console.log('\n🔑 Login Credentials:');
    console.log('Demo User: demo@demo.com / Demo@123');
    console.log('Admin User: admin@demo.com / Admin@123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
