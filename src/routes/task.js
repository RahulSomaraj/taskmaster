const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { validateTask, requireAuth } = require('../middlewares/validators');
const { requireAuth: requireAuthMiddleware } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(requireAuthMiddleware);

// Show daily tasks
router.get('/daily', taskController.showDaily);

// Show monthly tasks
router.get('/monthly', taskController.showMonthly);

// Show deleted tasks
router.get('/deleted', taskController.showDeletedTasks);

// Show task form (create)
router.get('/create', taskController.showTaskForm);

// Create new task
router.post('/', validateTask, taskController.createTask);

// Show task form (edit)
router.get('/:id/edit', taskController.showTaskForm);

// Update task
router.put('/:id', validateTask, taskController.updateTask);

// Complete task
router.post('/:id/complete', taskController.completeTask);

// Cancel task
router.post('/:id/cancel', taskController.cancelTask);

// Reset task to pending
router.post('/:id/reset', taskController.resetTask);

// Delete task
router.delete('/:id', taskController.deleteTask);

// Restore soft-deleted task
router.post('/:id/restore', taskController.restoreTask);

// Bulk complete tasks
router.post('/bulk/complete', taskController.bulkComplete);

// Bulk delete tasks
router.post('/bulk/delete', taskController.bulkDelete);

// API routes
router.get('/api/tasks', taskController.getTasks);

module.exports = router;
