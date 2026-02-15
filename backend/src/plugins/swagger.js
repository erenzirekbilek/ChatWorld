// src/plugins/swagger.js
// Fastify Swagger UI Plugin
// Erişim: http://localhost:3000/documentation

const fastifySwagger = require('@fastify/swagger');
const fastifySwaggerUi = require('@fastify/swagger-ui');

module.exports = async (fastify) => {
  // ===================================
  // Swagger Configuration
  // ===================================
  await fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'ChatWorld API',
        description: 'A modern social messaging and friendship platform API',
        version: '1.0.0',
        contact: {
          name: 'ChatWorld Support',
          email: 'support@chatworld.example.com',
          url: 'https://chatworld.example.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      host: process.env.API_HOST || 'localhost:3000',
      schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'JWT Bearer token'
        }
      }
    },
    exposeRoute: true,
    routePrefix: '/api-docs'
  });

  // ===================================
  // Swagger UI Configuration
  // ===================================
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      presets: [
        require('swagger-ui-dist/swagger-ui-bundle').presets.apis,
        require('swagger-ui-dist/swagger-ui-bundle').SwaggerUIStandalonePreset
      ]
    },
    uiHooks: {
      onRequest: async (request, reply) => {
        // Optional: Add authentication for documentation
      }
    },
    staticCSP: false,
    transformStaticCSP: (header) => header
  });

  console.log('✅ Swagger UI available at: http://localhost:3000/documentation');
  console.log('📋 API JSON Schema at: http://localhost:3000/api-docs/json');
};