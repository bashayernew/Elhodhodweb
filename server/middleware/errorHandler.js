const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500
  };

  // Prisma validation error
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    error = {
      message: `${field} already exists`,
      statusCode: 400
    };
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    error = {
      message: 'Record not found',
      statusCode: 404
    };
  }

  // Prisma validation error
  if (err.code === 'P2000') {
    error = {
      message: 'Data validation failed',
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401
    };
  }

  // Rate limit errors
  if (err.status === 429) {
    error = {
      message: 'Too many requests',
      statusCode: 429
    };
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
