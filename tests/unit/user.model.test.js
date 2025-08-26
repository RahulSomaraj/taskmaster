const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/User');
const bcrypt = require('bcrypt');

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

describe('User Model', () => {
  describe('Schema Validation', () => {
    test('should create a valid user', async () => {
      const validUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user'
      };

      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser.role).toBe(validUser.role);
      expect(savedUser.passwordHash).toBeDefined();
      expect(savedUser.passwordHash).not.toBe(validUser.password);
    });

    test('should require email', async () => {
      const userWithoutEmail = new User({
        password: 'password123',
        name: 'Test User'
      });

      let err;
      try {
        await userWithoutEmail.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.email).toBeDefined();
    });

    test('should require password', async () => {
      const userWithoutPassword = new User({
        email: 'test@example.com',
        name: 'Test User'
      });

      let err;
      try {
        await userWithoutPassword.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.passwordHash).toBeDefined();
    });

    test('should require name', async () => {
      const userWithoutName = new User({
        email: 'test@example.com',
        password: 'password123'
      });

      let err;
      try {
        await userWithoutPassword.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.name).toBeDefined();
    });

    test('should validate email format', async () => {
      const userWithInvalidEmail = new User({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      });

      let err;
      try {
        await userWithInvalidEmail.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.email).toBeDefined();
    });

    test('should enforce unique email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      await new User(userData).save();

      const duplicateUser = new User(userData);
      let err;
      try {
        await duplicateUser.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.code).toBe(11000); // MongoDB duplicate key error
    });

    test('should set default role to user', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      const savedUser = await user.save();
      expect(savedUser.role).toBe('user');
    });

    test('should validate role enum values', async () => {
      const userWithInvalidRole = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'invalid-role'
      });

      let err;
      try {
        await userWithInvalidRole.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.role).toBeDefined();
    });
  });

  describe('Virtual Properties', () => {
    test('should hash password when setting password virtual', async () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User'
      });

      user.password = 'password123';
      await user.save();

      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe('password123');
    });

    test('should return undefined when getting password virtual', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      await user.save();
      expect(user.password).toBeUndefined();
    });
  });

  describe('Instance Methods', () => {
    test('should compare password correctly', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    test('should return public JSON without password hash', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'admin'
      });

      await user.save();

      const publicJSON = user.toPublicJSON();
      
      expect(publicJSON._id).toBeDefined();
      expect(publicJSON.email).toBe('test@example.com');
      expect(publicJSON.name).toBe('Test User');
      expect(publicJSON.role).toBe('admin');
      expect(publicJSON.createdAt).toBeDefined();
      expect(publicJSON.updatedAt).toBeDefined();
      expect(publicJSON.passwordHash).toBeUndefined();
    });
  });

  describe('Indexes', () => {
    test('should have unique email index', async () => {
      const indexes = await User.collection.getIndexes();
      const emailIndex = Object.values(indexes).find(index => 
        index.key && index.key.email === 1
      );

      expect(emailIndex).toBeDefined();
      expect(emailIndex.unique).toBe(true);
    });
  });

  describe('Timestamps', () => {
    test('should set timestamps automatically', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt on save', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      const savedUser = await user.save();
      const originalUpdatedAt = savedUser.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedUser.name = 'Updated Name';
      const updatedUser = await savedUser.save();

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Password Hashing', () => {
    test('should hash password with bcrypt', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      await user.save();

      // Verify the hash is a valid bcrypt hash
      const isValidHash = await bcrypt.compare('password123', user.passwordHash);
      expect(isValidHash).toBe(true);
    });

    test('should use salt rounds', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      await user.save();

      // Check that the hash starts with $2b$ (bcrypt identifier)
      expect(user.passwordHash).toMatch(/^\$2[aby]\$\d{1,2}\$/);
    });
  });
});
