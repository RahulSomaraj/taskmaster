const taskService = require('../services/task.service');
const rewardsService = require('../services/rewards.service');
const dayjs = require('dayjs');

class TaskController {
  // Show daily tasks page
  async showDaily(req, res) {
    try {
      const date = req.query.date ? dayjs(req.query.date).toDate() : new Date();
      const tasks = await taskService.getTasksForDate(req.user._id, date);

      // Set isOverdue property on each task for EJS template
      const now = new Date();
      tasks.forEach(task => {
        if (task.status === 'pending') {
          const taskDate = new Date(task.date);
          if (task.dueTime) {
            const [hours, minutes] = task.dueTime.split(':');
            taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else {
            taskDate.setHours(23, 59, 59, 999);
          }
          task.isOverdue = now > taskDate;
        } else {
          task.isOverdue = false;
        }
      });

      // Calculate statistics
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length,
        overdue: tasks.filter(t => t.isOverdue).length,
      };

      res.render('tasks/daily', {
        title: 'Daily Tasks',
        tasks,
        stats,
        selectedDate: dayjs(date).format('YYYY-MM-DD'),
        categories: [
          'work',
          'personal',
          'health',
          'finance',
          'education',
          'shopping',
          'newshop',
          'travel',
          'other',
        ],
        priorities: ['low', 'medium', 'high'],
      });
    } catch (error) {
      console.error('Daily tasks error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while loading tasks.',
      };
      res.redirect('/');
    }
  }

  // Show monthly tasks page
  async showMonthly(req, res) {
    try {
      const year = parseInt(req.query.year) || dayjs().year();
      const month = parseInt(req.query.month) || dayjs().month() + 1;

      const monthlyTasks = await taskService.getMonthlyTasks(req.user._id, year, month);

      res.render('tasks/monthly', {
        title: 'Monthly View',
        monthlyTasks,
        selectedYear: year,
        selectedMonth: month,
        currentDate: dayjs(),
      });
    } catch (error) {
      console.error('Monthly tasks error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while loading monthly view.',
      };
      res.redirect('/');
    }
  }

  // Show deleted tasks page
  async showDeletedTasks(req, res) {
    try {
      const deletedTasks = await taskService.getDeletedTasks(req.user._id);

      res.render('tasks/deleted', {
        title: 'Deleted Tasks',
        deletedTasks,
      });
    } catch (error) {
      console.error('Deleted tasks error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while loading deleted tasks.',
      };
      res.redirect('/tasks/daily');
    }
  }

  // Show task form (create/edit)
  async showTaskForm(req, res) {
    try {
      const taskId = req.params.id;
      let task = null;
      let isEdit = false;

      if (taskId) {
        task = await taskService.getTaskById(taskId, req.user._id);
        if (!task) {
          req.session.flash = {
            type: 'error',
            message: 'Task not found.',
          };
          return res.redirect('/tasks/daily');
        }
        isEdit = true;
      }

      res.render('tasks/form', {
        title: isEdit ? 'Edit Task' : 'Create Task',
        task,
        isEdit,
        categories: [
          'work',
          'personal',
          'health',
          'finance',
          'education',
          'shopping',
          'newshop',
          'travel',
          'other',
        ],
        priorities: ['low', 'medium', 'high'],
      });
    } catch (error) {
      console.error('Task form error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while loading the form.',
      };
      res.redirect('/tasks/daily');
    }
  }

  // Create new task
  async createTask(req, res) {
    try {
      const taskData = req.validatedData;
      await taskService.createTask(req.user._id, taskData);

      // Get motivational quote for task creation (different each time)
      const motivationalQuote = rewardsService.getRandomQuote('taskCreated');

      req.session.flash = {
        type: 'success',
        message: 'Task created successfully.',
        motivationalQuote: motivationalQuote,
      };

      res.redirect(`/tasks/daily?date=${dayjs(taskData.date).format('YYYY-MM-DD')}`);
    } catch (error) {
      console.error('Create task error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while creating the task.',
      };
      res.redirect('/tasks/daily');
    }
  }

  // Update task
  async updateTask(req, res) {
    try {
      const taskId = req.params.id;
      const updateData = req.validatedData;

      const task = await taskService.updateTask(taskId, req.user._id, updateData);
      if (!task) {
        req.session.flash = {
          type: 'error',
          message: 'Task not found.',
        };
        return res.redirect('/tasks/daily');
      }

      req.session.flash = {
        type: 'success',
        message: 'Task updated successfully.',
      };

      res.redirect(`/tasks/daily?date=${dayjs(task.date).format('YYYY-MM-DD')}`);
    } catch (error) {
      console.error('Update task error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while updating the task.',
      };
      res.redirect('/tasks/daily');
    }
  }

  // Reset task (mark as pending)
  async resetTask(req, res) {
    try {
      const taskId = req.params.id;
      const task = await taskService.resetTask(taskId, req.user._id);

      // Get motivational quote for task reset
      const motivationalQuote = rewardsService.getRandomQuote('taskReset');

      // Check if it's an AJAX request (either xhr or fetch)
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.json({
          success: true,
          message: 'Task reset successfully.',
          task: {
            id: task._id,
            status: task.status,
            completedAt: task.completedAt,
          },
          rewards: {
            motivationalQuote,
          },
        });
      }

      req.session.flash = {
        type: 'success',
        message: 'Task reset successfully.',
        motivationalQuote: motivationalQuote,
      };

      res.redirect('back');
    } catch (error) {
      console.error('Reset task error:', error);

      // Check if it's an AJAX request (either xhr or fetch)
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while resetting the task.',
        });
      }

      req.session.flash = {
        type: 'error',
        message: 'An error occurred while resetting the task.',
      };
      res.redirect('back');
    }
  }

  // Complete task
  async completeTask(req, res) {
    try {
      const taskId = req.params.id;
      const task = await taskService.completeTask(taskId, req.user._id);

      // Get user stats for achievements
      const userStats = await taskService.getTaskStats(
        req.user._id,
        dayjs().subtract(30, 'days').toDate(),
        new Date()
      );
      const completedTasks = await taskService.getTasksForDateRange(
        req.user._id,
        dayjs().subtract(30, 'days').toDate(),
        new Date()
      );
      const currentStreak = rewardsService.calculateStreak(
        completedTasks.filter(t => t.status === 'completed')
      );

      // Get motivational quote and check for achievements (different each time)
      const motivationalQuote = rewardsService.getRandomQuote('taskCompleted');
      const streakMessage = rewardsService.getStreakMessage(currentStreak);
      const milestoneMessage = rewardsService.getMilestoneMessage(userStats.completed);
      const newAchievements = rewardsService.checkAchievements({
        totalCompleted: userStats.completed,
        currentStreak: currentStreak,
      });

      // Check if it's an AJAX request (either xhr or fetch)
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.json({
          success: true,
          message: 'Task completed successfully.',
          task: {
            id: task._id,
            status: task.status,
            completedAt: task.completedAt,
          },
          rewards: {
            motivationalQuote,
            streakMessage,
            milestoneMessage,
            newAchievements,
            currentStreak,
          },
        });
      }

      req.session.flash = {
        type: 'success',
        message: 'Task completed successfully.',
        motivationalQuote: motivationalQuote,
        streakMessage: streakMessage,
        milestoneMessage: milestoneMessage,
        newAchievements: newAchievements,
      };

      res.redirect('back');
    } catch (error) {
      console.error('Complete task error:', error);

      // Check if it's an AJAX request (either xhr or fetch)
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while completing the task.',
        });
      }

      req.session.flash = {
        type: 'error',
        message: 'An error occurred while completing the task.',
      };
      res.redirect('back');
    }
  }

  // Cancel task
  async cancelTask(req, res) {
    try {
      const taskId = req.params.id;
      const task = await taskService.cancelTask(taskId, req.user._id);

      if (req.xhr) {
        return res.json({
          success: true,
          message: 'Task cancelled successfully.',
          task: {
            id: task._id,
            status: task.status,
          },
        });
      }

      req.session.flash = {
        type: 'success',
        message: 'Task cancelled successfully.',
      };

      res.redirect('back');
    } catch (error) {
      console.error('Cancel task error:', error);

      if (req.xhr) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while cancelling the task.',
        });
      }

      req.session.flash = {
        type: 'error',
        message: 'An error occurred while cancelling the task.',
      };
      res.redirect('back');
    }
  }

  // Delete task
  async deleteTask(req, res) {
    try {
      const taskId = req.params.id;
      const task = await taskService.deleteTask(taskId, req.user._id);

      if (!task) {
        req.session.flash = {
          type: 'error',
          message: 'Task not found.',
        };
        return res.redirect('/tasks/daily');
      }

      // Check if it's an AJAX request (either xhr or fetch)
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.json({
          success: true,
          message: 'Task deleted successfully.',
        });
      }

      req.session.flash = {
        type: 'success',
        message: 'Task deleted successfully.',
      };

      res.redirect('back');
    } catch (error) {
      console.error('Delete task error:', error);

      // Check if it's an AJAX request (either xhr or fetch)
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while deleting the task.',
        });
      }

      req.session.flash = {
        type: 'error',
        message: 'An error occurred while deleting the task.',
      };
      res.redirect('back');
    }
  }

  // Restore soft-deleted task
  async restoreTask(req, res) {
    try {
      const taskId = req.params.id;
      const task = await taskService.restoreTask(taskId, req.user._id);

      if (req.xhr) {
        return res.json({
          success: true,
          message: 'Task restored successfully.',
          task: {
            id: task._id,
            title: task.title,
            status: task.status,
          },
        });
      }

      req.session.flash = {
        type: 'success',
        message: 'Task restored successfully.',
      };

      res.redirect('back');
    } catch (error) {
      console.error('Restore task error:', error);

      if (req.xhr) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while restoring the task.',
        });
      }

      req.session.flash = {
        type: 'error',
        message: 'An error occurred while restoring the task.',
      };
      res.redirect('back');
    }
  }

  // Bulk complete tasks
  async bulkComplete(req, res) {
    try {
      const { taskIds } = req.body;

      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No tasks selected.',
        });
      }

      await taskService.bulkCompleteTasks(taskIds, req.user._id);

      res.json({
        success: true,
        message: `${taskIds.length} task(s) completed successfully.`,
      });
    } catch (error) {
      console.error('Bulk complete error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while completing tasks.',
      });
    }
  }

  // Bulk delete tasks
  async bulkDelete(req, res) {
    try {
      const { taskIds } = req.body;

      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No tasks selected.',
        });
      }

      await taskService.bulkDeleteTasks(taskIds, req.user._id);

      res.json({
        success: true,
        message: `${taskIds.length} task(s) deleted successfully.`,
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while deleting tasks.',
      });
    }
  }

  // Get tasks for API
  async getTasks(req, res) {
    try {
      const { date, status, category, priority } = req.query;
      let tasks;

      if (date) {
        tasks = await taskService.getTasksForDate(req.user._id, new Date(date));
      } else {
        const filters = { status, category, priority };
        tasks = await taskService.getTasksWithFilters(req.user._id, filters);
      }

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while fetching tasks.',
      });
    }
  }

  // Get tasks by status (API endpoint)
  async getTasksByStatus(req, res) {
    try {
      const { status, date } = req.query;
      const queryDate = date ? dayjs(date).toDate() : new Date();

      let tasks = await taskService.getTasksForDate(req.user._id, queryDate);

      // Set isOverdue property on each task
      const now = new Date();
      tasks.forEach(task => {
        if (task.status === 'pending') {
          const taskDate = new Date(task.date);
          if (task.dueTime) {
            const [hours, minutes] = task.dueTime.split(':');
            taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else {
            taskDate.setHours(23, 59, 59, 999);
          }
          task.isOverdue = now > taskDate;
        } else {
          task.isOverdue = false;
        }
      });

      // Filter tasks based on status
      let filteredTasks = [];
      switch (status) {
        case 'all':
          filteredTasks = tasks;
          break;
        case 'pending':
          filteredTasks = tasks.filter(t => t.status === 'pending');
          break;
        case 'completed':
          filteredTasks = tasks.filter(t => t.status === 'completed');
          break;
        case 'overdue':
          filteredTasks = tasks.filter(t => t.isOverdue);
          break;
        default:
          filteredTasks = tasks;
      }

      res.json({
        success: true,
        tasks: filteredTasks,
        count: filteredTasks.length,
      });
    } catch (error) {
      console.error('Get tasks by status error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching tasks.',
      });
    }
  }

  // Get daily tasks for API (dashboard integration)
  async getDailyTasksAPI(req, res) {
    try {
      const { date, tab } = req.query;
      const queryDate = date ? dayjs(date).toDate() : new Date();

      let tasks = await taskService.getTasksForDate(req.user._id, queryDate);

      // Set isOverdue property on each task
      const now = new Date();
      tasks.forEach(task => {
        if (task.status === 'pending') {
          const taskDate = new Date(task.date);
          if (task.dueTime) {
            const [hours, minutes] = task.dueTime.split(':');
            taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else {
            taskDate.setHours(23, 59, 59, 999);
          }
          task.isOverdue = now > taskDate;
        } else {
          task.isOverdue = false;
        }
      });

      // Filter tasks based on tab
      let filteredTasks = [];
      switch (tab) {
        case 'all':
          filteredTasks = tasks;
          break;
        case 'pending':
          filteredTasks = tasks.filter(t => t.status === 'pending');
          break;
        case 'completed':
          filteredTasks = tasks.filter(t => t.status === 'completed');
          break;
        case 'overdue':
          filteredTasks = tasks.filter(t => t.isOverdue);
          break;
        default:
          filteredTasks = tasks;
      }

      res.json({
        success: true,
        tasks: filteredTasks,
        count: filteredTasks.length,
      });
    } catch (error) {
      console.error('Get daily tasks API error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching tasks.',
      });
    }
  }
}

module.exports = new TaskController();
