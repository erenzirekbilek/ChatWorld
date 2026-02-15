// src/config/swagger.js

module.exports = {
  swagger: {
    info: {
      title: 'The Slow App API',
      description: 'Letter-based social network with distance-based delivery',
      version: '1.0.0'
    },
    host: 'localhost:3000',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      apiKey: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    }
  },
  uiConfig: {
    routePrefix: '/documentation',
    exposeRoute: true
  }
};