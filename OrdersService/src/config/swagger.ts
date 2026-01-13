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
            paymentMethod: {
              type: "string",
              enum: ["CREDIT_CARD", "CASH_ON_DELIVERY"],
              example: "CREDIT_CARD",
              description: "Payment method used for this order"
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
        Payment: {
          type: "object",
          required: ["method"],
          properties: {
            method: {
              type: "string",
              enum: ["CREDIT_CARD", "CASH_ON_DELIVERY"],
              example: "CREDIT_CARD",
              description: "Payment method - CREDIT_CARD triggers payment processing via RabbitMQ"
            },
            cardNumber: {
              type: "string",
              example: "4242424242424242",
              description: "Required for CREDIT_CARD payments - 16 digits"
            },
            expiryMonth: {
              type: "string",
              example: "12",
              description: "Required for CREDIT_CARD payments - MM format"
            },
            expiryYear: {
              type: "string",
              example: "25",
              description: "Required for CREDIT_CARD payments - YY format"
            },
            cvv: {
              type: "string",
              example: "123",
              description: "Required for CREDIT_CARD payments - 3 or 4 digits"
            },
            cardholderName: {
              type: "string",
              example: "John Doe",
              description: "Required for CREDIT_CARD payments"
            }
          }
        },
        CreateOrderRequest: {
          type: "object",
          required: ["restaurantId", "deliveryAddress", "items", "payment"],
          properties: {
            restaurantId: {
              type: "string",
              example: "1",
              description: "ID of the restaurant"
            },
            deliveryAddress: {
              type: "string",
              example: "123 Main St, Apt 4B",
              description: "Full delivery address"
            },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["menuItemId", "quantity"],
                properties: {
                  menuItemId: {
                    type: "string",
                    example: "1"
                  },
                  quantity: {
                    type: "integer",
                    minimum: 1,
                    example: 2
                  },
                  specialInstructions: {
                    type: "string",
                    example: "Extra cheese, no onions"
                  }
                }
              },
              minItems: 1
            },
            deliveryFee: {
              type: "number",
              format: "float",
              example: 5.99,
              description: "Delivery fee amount"
            },
            notes: {
              type: "string",
              example: "Please ring the doorbell",
              description: "Additional order notes"
            },
            payment: {
              $ref: "#/components/schemas/Payment",
              description: "Payment details (required). If method is CASH_ON_DELIVERY, only method field is needed. If method is CREDIT_CARD, card details are required and order is sent to PaymentService via RabbitMQ."
            }
          }
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
