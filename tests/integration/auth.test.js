const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication Endpoints', () => {
  describe('POST /register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(302); // Redirect after successful registration

      // Check if user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('user');
    });

    test('should fail with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('should fail with password mismatch', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      // Create first user
      await request(app)
        .post('/register')
        .send(userData)
        .expect(302);

      // Try to create duplicate
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      await request(app)
        .post('/register')
        .send(userData);
    });

    test('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(302); // Redirect after successful login

      // Check if session was created
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should fail with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('should fail with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/logout')
        .expect(302); // Redirect after logout

      // Check if session was destroyed
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /profile', () => {
    test('should redirect to login when not authenticated', async () => {
      const response = await request(app)
        .get('/profile')
        .expect(302);

      expect(response.headers.location).toContain('/login');
    });

    test('should show profile when authenticated', async () => {
      // First register and login
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      await request(app)
        .post('/register')
        .send(userData);

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const loginResponse = await request(app)
        .post('/login')
        .send(loginData);

      // Get cookies from login response
      const cookies = loginResponse.headers['set-cookie'];

      // Access profile with session
      const response = await request(app)
        .get('/profile')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.text).toContain('Test User');
      expect(response.text).toContain('test@example.com');
    });
  });

  describe('Authentication Middleware', () => {
    test('should protect routes when not authenticated', async () => {
      const response = await request(app)
        .get('/tasks/daily')
        .expect(302);

      expect(response.headers.location).toContain('/login');
    });

    test('should allow access to protected routes when authenticated', async () => {
      // Register and login
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      await request(app)
        .post('/register')
        .send(userData);

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const loginResponse = await request(app)
        .post('/login')
        .send(loginData);

      const cookies = loginResponse.headers['set-cookie'];

      // Access protected route
      const response = await request(app)
        .get('/tasks/daily')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.text).toContain('Daily Tasks');
    });
  });

  describe('CSRF Protection', () => {
    test('should reject requests without CSRF token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(403); // CSRF token missing

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Rate Limiting', () => {
    test('should limit login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/login')
          .send(loginData)
          .expect(400);
      }

      // Next attempt should be rate limited
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(429); // Too Many Requests

      expect(response.body).toHaveProperty('message');
    });
  });
});
