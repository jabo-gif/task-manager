const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description:
        'REST API for creating, viewing, editing, deleting, filtering and searching tasks. ' +
        'All /tasks endpoints require a Bearer JWT obtained from /auth/login.',
    },
    servers: [{ url: '/api', description: 'API base path' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Write project report' },
            description: { type: 'string', example: 'Summarize Q3 progress' },
            status: { type: 'string', enum: ['Pending', 'Completed'], example: 'Pending' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'Medium' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Write project report' },
            description: { type: 'string', example: 'Summarize Q3 progress' },
            status: { type: 'string', enum: ['Pending', 'Completed'] },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
