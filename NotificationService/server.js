import Fastify from 'fastify';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './models/Notification.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

dotenv.config();

const fastify = Fastify({ logger: true });

// Swagger konfiguracija
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Notification Service API',
      description: 'API za upravljanje obvestil v DishDash sistemu',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3004',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'notifications', description: 'Operacije za obvestila' }
    ]
  }
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header) => header
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notification-db';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

fastify.get('/', async (request, reply) => {
  return { 
    service: 'Notification Service',
    status: 'running',
    timestamp: new Date().toISOString()
  };
});

// GET /notifications/status/:id - preveri status obvestila
fastify.get('/notifications/status/:id', {
  schema: {
    description: 'Preveri status obvestila',
    tags: ['notifications'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID obvestila' }
      },
      required: ['id']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              status: { type: 'string' },
              sentAt: { type: 'string' },
              readAt: { type: 'string' },
              isRead: { type: 'boolean' }
            }
          }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findById(id).select('status sentAt readAt isRead');
    
    if (!notification) {
      return reply.status(404).send({
        success: false,
        message: 'Notification not found'
      });
    }

    return {
      success: true,
      data: notification
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error fetching notification status',
      error: err.message
    });
  }
});

// GET /notifications/user/:userId - pridobi vsa obvestila uporabnika
fastify.get('/notifications/user/:userId', {
  schema: {
    description: 'Pridobi vsa obvestila uporabnika',
    tags: ['notifications'],
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'ID uporabnika' }
      },
      required: ['userId']
    },
    querystring: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter po statusu' },
        isRead: { type: 'string', description: 'Filter po prebrano (true/false)' },
        limit: { type: 'number', description: 'Število rezultatov', default: 50 },
        skip: { type: 'number', description: 'Preskoči rezultate', default: 0 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          count: { type: 'number' },
          total: { type: 'number' },
          unreadCount: { type: 'number' },
          data: { type: 'array' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { userId } = request.params;
    const { status, isRead, limit = 50, skip = 0 } = request.query;
    
    const filter = { userId };
    if (status) filter.status = status;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      data: notifications
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error fetching notifications',
      error: err.message
    });
  }
});

// POST /notifications/send - pošlje obvestilo
fastify.post('/notifications/send', {
  schema: {
    description: 'Pošlje novo obvestilo',
    tags: ['notifications'],
    body: {
      type: 'object',
      required: ['userId', 'title', 'message'],
      properties: {
        userId: { type: 'string', description: 'ID uporabnika' },
        type: { type: 'string', description: 'Tip obvestila (info/warning/error/success)', default: 'info' },
        title: { type: 'string', description: 'Naslov obvestila' },
        message: { type: 'string', description: 'Sporočilo' },
        priority: { type: 'string', description: 'Prioriteta (low/medium/high)', default: 'medium' },
        metadata: { type: 'object', description: 'Dodatni podatki' }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { userId, type, title, message, priority, metadata } = request.body;

    if (!userId || !title || !message) {
      return reply.status(400).send({
        success: false,
        message: 'Missing required fields: userId, title, message'
      });
    }

    const notification = new Notification({
      userId,
      type: type || 'info',
      title,
      message,
      priority: priority || 'medium',
      metadata: metadata || {},
      status: 'sent',
      sentAt: new Date()
    });

    await notification.save();

    reply.status(201).send({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error sending notification',
      error: err.message
    });
  }
});

// POST /notifications/bulk - pošlje več obvestil naenkrat
fastify.post('/notifications/bulk', {
  schema: {
    description: 'Pošlje več obvestil naenkrat',
    tags: ['notifications'],
    body: {
      type: 'object',
      required: ['notifications'],
      properties: {
        notifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              type: { type: 'string' },
              title: { type: 'string' },
              message: { type: 'string' },
              priority: { type: 'string' },
              metadata: { type: 'object' }
            }
          }
        }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'array' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { notifications } = request.body;
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid input: notifications array required'
      });
    }

    const notificationDocs = notifications.map(n => ({
      ...n,
      status: 'sent',
      sentAt: new Date()
    }));

    const createdNotifications = await Notification.insertMany(notificationDocs);

    reply.status(201).send({
      success: true,
      message: `${createdNotifications.length} notifications sent successfully`,
      data: createdNotifications
    });
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error sending notifications',
      error: err.message
    });
  }
});

// PUT /notifications/:id/read - označi obvestilo kot prebrano
fastify.put('/notifications/:id/read', {
  schema: {
    description: 'Označi obvestilo kot prebrano',
    tags: ['notifications'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID obvestila' }
      },
      required: ['id']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { 
        isRead: true,
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return reply.status(404).send({
        success: false,
        message: 'Notification not found'
      });
    }

    return {
      success: true,
      message: 'Notification marked as read',
      data: notification
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error updating notification',
      error: err.message
    });
  }
});

// PUT /notifications/:id - posodobi obvestilo
fastify.put('/notifications/:id', {
  schema: {
    description: 'Posodobi obvestilo',
    tags: ['notifications'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID obvestila' }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        title: { type: 'string' },
        message: { type: 'string' },
        priority: { type: 'string' },
        metadata: { type: 'object' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;
    const updateData = request.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!notification) {
      return reply.status(404).send({
        success: false,
        message: 'Notification not found'
      });
    }

    return {
      success: true,
      message: 'Notification updated successfully',
      data: notification
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error updating notification',
      error: err.message
    });
  }
});

// DELETE /notifications/:id - izbriše obvestilo
fastify.delete('/notifications/:id', {
  schema: {
    description: 'Izbriše obvestilo',
    tags: ['notifications'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID obvestila' }
      },
      required: ['id']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return reply.status(404).send({
        success: false,
        message: 'Notification not found'
      });
    }

    return {
      success: true,
      message: 'Notification deleted successfully',
      data: notification
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error deleting notification',
      error: err.message
    });
  }
});

// DELETE /notifications/user/:userId - izbriše vsa obvestila uporabnika
fastify.delete('/notifications/user/:userId', {
  schema: {
    description: 'Izbriše vsa obvestila uporabnika (potrebna potrditev)',
    tags: ['notifications'],
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'ID uporabnika' }
      },
      required: ['userId']
    },
    querystring: {
      type: 'object',
      required: ['confirm'],
      properties: {
        confirm: { type: 'string', description: 'Potrdi z "true"' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          deletedCount: { type: 'number' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { userId } = request.params;
    const { confirm } = request.query;

    if (confirm !== 'true') {
      return reply.status(400).send({
        success: false,
        message: 'Please confirm deletion by adding ?confirm=true to the request'
      });
    }

    const result = await Notification.deleteMany({ userId });

    return {
      success: true,
      message: `All notifications for user ${userId} deleted successfully`,
      deletedCount: result.deletedCount
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error deleting notifications',
      error: err.message
    });
  }
});

const start = async () => {
  try {
    await connectDB();
    
    const port = process.env.PORT || 3003;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port: parseInt(port), host });
    console.log(`Server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};


process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  await fastify.close();
  process.exit(0);
});

start();
