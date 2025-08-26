const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // CSRF token errors
  if (err.code === 'EBADCSRFTOKEN') {
    req.session.flash = {
      type: 'error',
      message: 'Form submission failed. Please try again.'
    };
    return res.redirect('back');
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    req.session.flash = {
      type: 'error',
      message: messages.join(', ')
    };
    return res.redirect('back');
  }

  // Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    req.session.flash = {
      type: 'error',
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`
    };
    return res.redirect('back');
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    req.session.flash = {
      type: 'error',
      message: 'Invalid resource ID.'
    };
    return res.redirect('back');
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const messages = err.errors.map(error => error.message);
    req.session.flash = {
      type: 'error',
      message: messages.join(', ')
    };
    return res.redirect('back');
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  // API requests
  if (req.xhr || req.path.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Web requests
  if (statusCode === 404) {
    return res.status(404).render('error', {
      title: 'Page Not Found',
      message: 'The page you are looking for does not exist.',
      status: 404,
      error: undefined
    });
  }

  // Server errors
  res.status(statusCode).render('error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? message : 'Something went wrong!',
    status: statusCode,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
