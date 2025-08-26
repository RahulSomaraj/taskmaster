// Jest setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo_analytics_test';
process.env.SESSION_SECRET = 'test-secret-key';

// Global test timeout
jest.setTimeout(10000);
