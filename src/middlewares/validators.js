const { z } = require('zod');

// Task validation schema
const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot be more than 200 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description cannot be more than 1000 characters')
    .trim()
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .transform(val => new Date(val)),
  dueTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format')
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum([
    'work',
    'personal',
    'health',
    'finance',
    'education',
    'shopping',
    'newshop',
    'travel',
    'other',
  ]),
  tags: z.array(z.string().max(50)).optional(),
  estimatedMinutes: z
    .number()
    .min(1, 'Estimated time must be at least 1 minute')
    .max(1440, 'Estimated time cannot exceed 24 hours')
    .optional(),
});

// User registration validation schema
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(50, 'Name cannot be more than 50 characters')
      .trim(),
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot be more than 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// User login validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

// Date range validation schema
const dateRangeSchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
    status: z.enum(['all', 'pending', 'completed', 'cancelled']).optional(),
    category: z.string().optional(),
    priority: z.enum(['all', 'low', 'medium', 'high']).optional(),
  })
  .refine(data => new Date(data.from) <= new Date(data.to), {
    message: 'End date must be after start date',
    path: ['to'],
  });

// Validation middleware factory
const validate = schema => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => err.message);
        req.session.flash = {
          type: 'error',
          message: messages.join(', '),
        };
        return res.redirect('back');
      }
      next(error);
    }
  };
};

// Query validation middleware factory
const validateQuery = schema => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => err.message);
        req.session.flash = {
          type: 'error',
          message: messages.join(', '),
        };
        return res.redirect('back');
      }
      next(error);
    }
  };
};

// Import redirectIfAuthenticated from auth middleware
const { redirectIfAuthenticated } = require('./auth');

module.exports = {
  validateTask: validate(taskSchema),
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateDateRange: validateQuery(dateRangeSchema),
  redirectIfAuthenticated,
  taskSchema,
  registerSchema,
  loginSchema,
  dateRangeSchema,
};
