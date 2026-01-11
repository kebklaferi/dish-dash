import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Orders Service API",
      version: "1.0.0",
      description: "Orders microservice for food delivery platform",
      contact: {
        name: "API Support",
        email: "support@fooddelivery.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8088/api/orders",
        description: "API Gateway",
      },
      {
        url: "http://localhost:3001",
        description: "Direct Access",
      },
    ],
    tags: [
      {
        name: "Orders",
        description: "Order management operations",
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        Order: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            customerId: {
              type: "string",
              example: "customer_123",
            },
            restaurantId: {
              type: "string",
              example: "rest_001",
            },
            deliveryAddress: {
              type: "string",
              example: "123 Main St, Apt 4B, New York, NY 10001",
            },
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/OrderItem",
              },
            },
            totalAmount: {
              type: "number",
              format: "float",
              example: 45.99,
            },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
              example: "pending",
            },
            deliveryFee: {
              type: "number",
              format: "float",
              example: 5.99,
            },
            notes: {
              type: "string",
              example: "Please ring the doorbell",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            orderId: {
              type: "string",
              format: "uuid",
            },
            menuItemId: {
              type: "string",
              example: "menu_001",
            },
            name: {
              type: "string",
              example: "Margherita Pizza",
            },
            quantity: {
              type: "integer",
              minimum: 1,
              example: 2,
            },
            price: {
              type: "number",
              format: "float",
              example: 12.99,
            },
            specialInstructions: {
              type: "string",
              example: "Extra cheese, no olives",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
