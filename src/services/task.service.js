const Task = require('../models/Task');
const dayjs = require('dayjs');

class TaskService {
  // Create a new task
  async createTask(userId, taskData) {
    const task = new Task({
      userId,
      ...taskData,
    });
    return await task.save();
  }

  // Get task by ID
  async getTaskById(taskId, userId) {
    return await Task.findOne({ _id: taskId, userId });
  }

  // Get tasks for a specific date
  async getTasksForDate(userId, date) {
    return await Task.getTasksForDate(userId, date);
  }

  // Get tasks for a date range
  async getTasksForDateRange(userId, startDate, endDate) {
    return await Task.getTasksForDateRange(userId, startDate, endDate);
  }

  // Get monthly tasks summary
  async getMonthlyTasks(userId, year, month) {
    const startDate = dayjs()
      .year(year)
      .month(month - 1)
      .startOf('month')
      .toDate();
    const endDate = dayjs()
      .year(year)
      .month(month - 1)
      .endOf('month')
      .toDate();

    const tasks = await Task.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      deletedAt: null, // Exclude soft-deleted tasks
    }).sort({ date: 1 });

    // Group tasks by day
    const tasksByDay = {};
    const currentDate = dayjs(startDate);
    const endOfMonth = dayjs(endDate);

    while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth, 'day')) {
      const dateKey = currentDate.format('YYYY-MM-DD');
      tasksByDay[dateKey] = {
        date: currentDate.toDate(),
        tasks: [],
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        completionRate: 0,
      };
      currentDate.add(1, 'day');
    }

    // Populate tasks for each day
    tasks.forEach(task => {
      const dateKey = dayjs(task.date).format('YYYY-MM-DD');
      if (tasksByDay[dateKey]) {
        tasksByDay[dateKey].tasks.push(task);
        tasksByDay[dateKey].total++;

        switch (task.status) {
          case 'completed':
            tasksByDay[dateKey].completed++;
            break;
          case 'pending':
            tasksByDay[dateKey].pending++;
            break;
          case 'cancelled':
            tasksByDay[dateKey].cancelled++;
            break;
        }
      }
    });

    // Calculate completion rates
    Object.values(tasksByDay).forEach(day => {
      if (day.total > 0) {
        day.completionRate = Math.round((day.completed / day.total) * 100);
      }
    });

    return tasksByDay;
  }

  // Update a task
  async updateTask(taskId, userId, updateData) {
    return await Task.findOneAndUpdate({ _id: taskId, userId }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // Mark task as completed
  async completeTask(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw new Error('Task not found');
    }
    return await task.markCompleted();
  }

  // Mark task as cancelled
  async cancelTask(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw new Error('Task not found');
    }
    return await task.markCancelled();
  }

  // Reset task to pending
  async resetTask(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw new Error('Task not found');
    }
    return await task.resetToPending();
  }

  // Delete a task (soft delete)
  async deleteTask(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw new Error('Task not found');
    }
    return await task.softDelete();
  }

  // Restore a soft-deleted task
  async restoreTask(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, userId, deletedAt: { $ne: null } });
    if (!task) {
      throw new Error('Task not found or not deleted');
    }
    return await task.restore();
  }

  // Get overdue tasks
  async getOverdueTasks(userId) {
    return await Task.getOverdueTasks(userId);
  }

  // Get task statistics for a date range
  async getTaskStats(userId, startDate, endDate) {
    const tasks = await Task.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      deletedAt: null, // Exclude soft-deleted tasks
    });

    const stats = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      cancelled: 0,
      overdue: 0,
      byPriority: { low: 0, medium: 0, high: 0 },
      byCategory: {},
      averageCompletionTime: 0,
      completionRate: 0,
    };

    let totalCompletionTime = 0;
    let completedTasks = 0;

    tasks.forEach(task => {
      // Count by status
      stats[task.status]++;

      // Count by priority
      stats.byPriority[task.priority]++;

      // Count by category
      if (!stats.byCategory[task.category]) {
        stats.byCategory[task.category] = 0;
      }
      stats.byCategory[task.category]++;

      // Check if overdue
      if (task.isOverdue) {
        stats.overdue++;
      }

      // Calculate completion time
      if (task.status === 'completed' && task.completionTimeMinutes) {
        totalCompletionTime += task.completionTimeMinutes;
        completedTasks++;
      }
    });

    // Calculate averages
    if (completedTasks > 0) {
      stats.averageCompletionTime = Math.round(totalCompletionTime / completedTasks);
    }

    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.completed / stats.total) * 100);
    }

    return stats;
  }

  // Get tasks with filters
  async getTasksWithFilters(userId, filters) {
    const query = { userId };

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.priority && filters.priority !== 'all') {
      query.priority = filters.priority;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.dateFrom && filters.dateTo) {
      query.date = {
        $gte: new Date(filters.dateFrom),
        $lte: new Date(filters.dateTo),
      };
    }

    return await Task.find(query).sort({ date: -1, priority: -1 });
  }

  // Bulk operations
  async bulkCompleteTasks(taskIds, userId) {
    return await Task.updateMany(
      { _id: { $in: taskIds }, userId },
      {
        status: 'completed',
        completedAt: new Date(),
      }
    );
  }

  async bulkDeleteTasks(taskIds, userId) {
    return await Task.updateMany(
      { _id: { $in: taskIds }, userId },
      {
        deletedAt: new Date(),
      }
    );
  }

  // Get soft-deleted tasks
  async getDeletedTasks(userId) {
    return await Task.find({
      userId,
      deletedAt: { $ne: null },
    }).sort({ deletedAt: -1 });
  }
}

module.exports = new TaskService();
