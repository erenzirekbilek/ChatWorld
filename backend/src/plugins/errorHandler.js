const fp = require('fastify-plugin');

async function errorHandler(fastify) {
  fastify.setErrorHandler(async (error, request, reply) => {
    request.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.validation,
      });
    }

    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again later.',
      });
    }

    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal server error';

    return reply.status(statusCode).send({
      success: false,
      error: statusCode >= 500 ? 'Internal server error' : message,
    });
  });

  fastify.setNotFoundHandler(async (request, reply) => {
    return reply.status(404).send({
      success: false,
      error: 'Route not found',
    });
  });
}

module.exports = fp(errorHandler, {
  name: 'error-handler',
});
