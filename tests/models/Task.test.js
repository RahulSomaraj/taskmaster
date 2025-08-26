const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Task = require('../../src/models/Task');
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
  await Task.deleteMany({});
  await User.deleteMany({});
});

describe('Task Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    await testUser.save();
  });

  describe('Validation', () => {
    it('should create a valid task', async () => {
      const taskData = {
        userId: testUser._id,
        title: 'Test Task',
        description: 'Test Description',
        date: new Date(),
        priority: 'medium',
        category: 'work',
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask._id).toBeDefined();
      expect(savedTask.title).toBe(taskData.title);
      expect(savedTask.status).toBe('pending'); // default value
    });

    it('should require userId', async () => {
      const taskData = {
        title: 'Test Task',
        date: new Date(),
        priority: 'medium',
        category: 'work',
      };

      const task = new Task(taskData);
      await expect(task.save()).rejects.toThrow();
    });

    it('should require title', async () => {
      const taskData = {
        userId: testUser._id,
        date: new Date(),
        priority: 'medium',
        category: 'work',
      };

      const task = new Task(taskData);
      await expect(task.save()).rejects.toThrow();
    });

    it('should require date', async () => {
      const taskData = {
        userId: testUser._id,
        title: 'Test Task',
        priority: 'medium',
        category: 'work',
      };

      const task = new Task(taskData);
      await expect(task.save()).rejects.toThrow();
    });

    it('should require category', async () => {
      const taskData = {
        userId: testUser._id,
        title: 'Test Task',
        date: new Date(),
        priority: 'medium',
      };

      const task = new Task(taskData);
      await expect(task.save()).rejects.toThrow();
    });

    it('should validate priority enum', async () => {
      const taskData = {
        userId: testUser._id,
        title: 'Test Task',
        date: new Date(),
        priority: 'invalid',
        category: 'work',
      };

      const task = new Task(taskData);
      await expect(task.save()).rejects.toThrow();
    });

    it('should validate category enum', async () => {
      const taskData = {
        userId: testUser._id,
        title: 'Test Task',
        date: new Date(),
        priority: 'medium',
        category: 'invalid',
      };

      const task = new Task(taskData);
      await expect(task.save()).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const taskData = {
        userId: testUser._id,
        title: 'Test Task',
        date: new Date(),
        priority: 'medium',
        category: 'work',
        status: 'invalid',
      };

      const task = new Task(taskData);
      await expect(task.save()).rejects.toThrow();
    });
  });

  describe('Virtuals', () => {
    it('should calculate completion time correctly', async () => {
      const task = new Task({
        userId: testUser._id,
        title: 'Test Task',
        date: new Date(),
        priority: 'medium',
        category: 'work',
        status: 'completed',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T11:30:00Z'),
      });

      await task.save();
      expect(task.completionTimeMinutes).toBe(90);
    });

    it('should return null for completion time if not completed', async () => {
      const task = new Task({
        userId: testUser._id,
        title: 'Test Task',
        date: new Date(),
        priority: 'medium',
        category: 'work',
        status: 'pending',
      });

      await task.save();
      expect(task.completionTimeMinutes).toBeNull();
    });

    it('should detect overdue tasks correctly', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const task = new Task({
        userId: testUser._id,
        title: 'Test Task',
        date: yesterday,
        priority: 'medium',
        category: 'work',
        status: 'pending',
      });

      await task.save();
      expect(task.isOverdue).toBe(true);
    });

    it('should not mark completed tasks as overdue', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const task = new Task({
        userId: testUser._id,
        title: 'Test Task',
        date: yesterday,
        priority: 'medium',
        category: 'work',
        status: 'completed',
      });

      await task.save();
      expect(task.isOverdue).toBe(false);
    });
  });

  describe('Instance Methods', () => {
    it('should mark task as completed', async () => {
      const task = new Task({
        userId: testUser._id,
        title: 'Test Task',
        date: new Date(),
        priority: 'medium',
        category: 'work',
      });

      await task.save();
      await task.markCompleted();

      expect(task.status).toBe('completed');
      expect(task.completedAt).toBeDefined();
    });

    it('should mark task as cancelled', async () => {
      const task = new Task({
        userId: testUser._id,
        title: 'Test Task',
        date: new Date(),
        priority: 'medium',
        category: 'work',
      });

      await task.save();
      await task.markCancelled();

      expect(task.status).toBe('cancelled');
    });

    it('should reset task to pending', async () => {
      const task = new Task({
        userId: testUser._id,
        title: 'Test Task',
        date: new Date(),
        priority: 'medium',
        category: 'work',
        status: 'completed',
        completedAt: new Date(),
      });

      await task.save();
      await task.resetToPending();

      expect(task.status).toBe('pending');
      expect(task.completedAt).toBeUndefined();
    });
  });

  describe('Static Methods', () => {
    it('should get tasks for a specific date', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const task1 = new Task({
        userId: testUser._id,
        title: 'Today Task',
        date: today,
        priority: 'medium',
        category: 'work',
      });

      const task2 = new Task({
        userId: testUser._id,
        title: 'Yesterday Task',
        date: yesterday,
        priority: 'medium',
        category: 'work',
      });

      await task1.save();
      await task2.save();

      const todayTasks = await Task.getTasksForDate(testUser._id, today);
      expect(todayTasks).toHaveLength(1);
      expect(todayTasks[0].title).toBe('Today Task');
    });

    it('should get overdue tasks', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const overdueTask = new Task({
        userId: testUser._id,
        title: 'Overdue Task',
        date: yesterday,
        priority: 'medium',
        category: 'work',
        status: 'pending',
      });

      const completedTask = new Task({
        userId: testUser._id,
        title: 'Completed Task',
        date: yesterday,
        priority: 'medium',
        category: 'work',
        status: 'completed',
      });

      await overdueTask.save();
      await completedTask.save();

      const overdueTasks = await Task.getOverdueTasks(testUser._id);
      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].title).toBe('Overdue Task');
    });
  });
});
