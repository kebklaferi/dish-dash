import { Express } from 'express';
import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Identity Service API',
      version: '1.0.0',
      description: 'API documentation for Identity Service (Users, Auth)',
    },
    servers: [
      {
        url: '/api/identity',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email', 'username', 'role'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['CUSTOMER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            username: 'user123',
            role: 'CUSTOMER',
            createdAt: '2025-01-01T12:00:00.000Z',
            updatedAt: '2025-01-02T12:00:00.000Z',
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/**/*.ts'], // TS files with Swagger comments
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
