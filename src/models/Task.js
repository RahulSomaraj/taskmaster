const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Task date is required'],
    },
    dueTime: {
      type: String,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'work',
        'personal',
        'health',
        'finance',
        'newshop',
        'education',
        'shopping',
        'travel',
        'other',
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot be more than 50 characters'],
      },
    ],
    estimatedMinutes: {
      type: Number,
      min: [1, 'Estimated time must be at least 1 minute'],
      max: [1440, 'Estimated time cannot exceed 24 hours'],
    },
    completedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, priority: 1 });

// Virtual for completion time in minutes
taskSchema.virtual('completionTimeMinutes').get(function () {
  if (this.completedAt && this.createdAt) {
    return Math.round((this.completedAt - this.createdAt) / (1000 * 60));
  }
  return null;
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'pending') {
    const now = new Date();
    const taskDate = new Date(this.date);
    if (this.dueTime) {
      const [hours, minutes] = this.dueTime.split(':');
      taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      taskDate.setHours(23, 59, 59, 999);
    }
    return now > taskDate;
  }
  return false;
});

// Instance method to mark as completed
taskSchema.methods.markCompleted = function () {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Instance method to mark as cancelled
taskSchema.methods.markCancelled = function () {
  this.status = 'cancelled';
  return this.save();
};

// Instance method to reset to pending
taskSchema.methods.resetToPending = function () {
  this.status = 'pending';
  this.completedAt = undefined;
  return this.save();
};

// Instance method for soft delete
taskSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

// Instance method to restore soft-deleted task
taskSchema.methods.restore = function () {
  this.deletedAt = null;
  return this.save();
};

// Static method to get tasks for a specific date
taskSchema.statics.getTasksForDate = function (userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
    deletedAt: null, // Exclude soft-deleted tasks
  }).sort({ priority: -1, createdAt: 1 });
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function (userId) {
  const now = new Date();
  return this.find({
    userId,
    status: 'pending',
    date: { $lt: now },
    deletedAt: null, // Exclude soft-deleted tasks
  }).sort({ date: 1 });
};

// Static method to get tasks for date range
taskSchema.statics.getTasksForDateRange = function (userId, startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    date: { $gte: start, $lte: end },
    deletedAt: null, // Exclude soft-deleted tasks
  }).sort({ date: 1, priority: -1 });
};

// Static method to get all tasks (including soft-deleted for admin purposes)
taskSchema.statics.getAllTasks = function (userId, includeDeleted = false) {
  const query = { userId };
  if (!includeDeleted) {
    query.deletedAt = null;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get soft-deleted tasks
taskSchema.statics.getDeletedTasks = function (userId) {
  return this.find({
    userId,
    deletedAt: { $ne: null },
  }).sort({ deletedAt: -1 });
};

// Pre-save middleware to validate date format
taskSchema.pre('save', function (next) {
  if (this.isModified('date')) {
    // Ensure date is set to start of day
    this.date.setHours(0, 0, 0, 0);
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
