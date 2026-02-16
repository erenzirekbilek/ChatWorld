// src/plugins/swagger.js

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
  await fastify.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'The Slow App API',
        description: 'Letter-based social network',
        version: '1.0.0'
      },
      host: 'localhost:3000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Add a JWT token to the header with ** Bearer ** prefix, e.g. Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
        }
      },
      security: [
        {
          Bearer: []
        }
      ]
    }
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    exposeRoute: true,
    uiConfig: {
      persistAuthorization: true,
      displayOperationId: true,
      defaultModelsExpandDepth: 1,
      docExpansion: 'list'
    }
  });

  console.log('✅ Swagger UI at http://localhost:3000/documentation');
}, { name: 'swagger' });