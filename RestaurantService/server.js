import Fastify from 'fastify';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from './models/Restaurant.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

dotenv.config();

const fastify = Fastify({ logger: true });

// Swagger konfiguracija
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Restaurant Service API',
      description: 'API za upravljanje restavracij v DishDash sistemu',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'restaurants', description: 'Operacije za restavracije' }
    ] 
  }
});

await fastify.register(swaggerUi, {
  routePrefix: '/api-docs',
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
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

fastify.get('/', async (request, reply) => {
  return { 
    service: 'Restaurant Service',
    status: 'running',
    timestamp: new Date().toISOString()
  };
});

// GET /restaurants - pridobi seznam restavracij
fastify.get('/restaurants', {
  schema: {
    description: 'Pridobi seznam vseh restavracij',
    tags: ['restaurants'],
    querystring: {
      type: 'object',
      properties: {
        isActive: {
          type: 'string',
          description: 'Filter po aktivnosti (true/false)'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          count: { type: 'number' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                address: { type: 'string' },
                workingHours: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { isActive } = request.query;
    const filter = isActive !== undefined ? { isActive: isActive === 'true' } : {};
    
    const restaurants = await Restaurant.find(filter).select('name address workingHours description');
    return {
      success: true,
      count: restaurants.length,
      data: restaurants
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error fetching restaurants',
      error: err.message
    });
  }
});

// GET /restaurants/:id - pridobi podrobnosti določene restavracije
fastify.get('/restaurants/:id', {
  schema: {
    description: 'Pridobi podrobnosti določene restavracije',
    tags: ['restaurants'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID restavracije'
        }
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
              name: { type: 'string' },
              address: { type: 'string' },
              workingHours: { type: 'string' },
              description: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string' },
              cuisine: { type: 'string' },
              rating: { type: 'number' },
              isActive: { type: 'boolean' }
            }
          }
        }
      },
      404: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
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
        message: 'Invalid restaurant ID'
      });
    }

    const restaurant = await Restaurant.findById(id);
    
    if (!restaurant) {
      return reply.status(404).send({
        success: false,
        message: 'Restaurant not found'
      });
    }

    return {
      success: true,
      data: restaurant
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error fetching restaurant',
      error: err.message
    });
  }
});

// POST /restaurants - doda novo restavracijo
fastify.post('/restaurants', {
  schema: {
    description: 'Ustvari novo restavracijo',
    tags: ['restaurants'],
    body: {
      type: 'object',
      required: ['name', 'address', 'workingHours', 'description'],
      properties: {
        name: { type: 'string', description: 'Ime restavracije' },
        address: { type: 'string', description: 'Naslov restavracije' },
        workingHours: { type: 'string', description: 'Delovni čas' },
        description: { type: 'string', description: 'Opis restavracije' },
        phone: { type: 'string', description: 'Telefonska številka' },
        email: { type: 'string', description: 'Email naslov' },
        cuisine: { type: 'string', description: 'Tip kuhinje' }
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
    const { name, address, workingHours, description, phone, email, cuisine } = request.body;

    if (!name || !address || !workingHours || !description) {
      return reply.status(400).send({
        success: false,
        message: 'Missing required fields: name, address, workingHours, description'
      });
    }

    const restaurant = new Restaurant({
      name,
      address,
      workingHours,
      description,
      phone,
      email,
      cuisine
    });

    await restaurant.save();

    reply.status(201).send({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error creating restaurant',
      error: err.message
    });
  }
});

// POST /restaurants/bulk - doda več restavracij naenkrat
fastify.post('/restaurants/bulk', {
  schema: {
    description: 'Ustvari več restavracij naenkrat',
    tags: ['restaurants'],
    body: {
      type: 'object',
      required: ['restaurants'],
      properties: {
        restaurants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
              workingHours: { type: 'string' },
              description: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string' },
              cuisine: { type: 'string' }
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
    const { restaurants } = request.body;

    if (!Array.isArray(restaurants) || restaurants.length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid input: restaurants array required'
      });
    }

    const createdRestaurants = await Restaurant.insertMany(restaurants);

    reply.status(201).send({
      success: true,
      message: `${createdRestaurants.length} restaurants created successfully`,
      data: createdRestaurants
    });
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error creating restaurants',
      error: err.message
    });
  }
});

// PUT /restaurants/:id - posodobi podatke o restavraciji
fastify.put('/restaurants/:id', {
  schema: {
    description: 'Posodobi podatke o restavraciji',
    tags: ['restaurants'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID restavracije' }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: { type: 'string' },
        workingHours: { type: 'string' },
        description: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        cuisine: { type: 'string' }
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
        message: 'Invalid restaurant ID'
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return reply.status(404).send({
        success: false,
        message: 'Restaurant not found'
      });
    }

    return {
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error updating restaurant',
      error: err.message
    });
  }
});

// PUT /restaurants/:id/status - posodobi status restavracije (aktivna/neaktivna)
fastify.put('/restaurants/:id/status', {
  schema: {
    description: 'Posodobi status restavracije (aktivna/neaktivna)',
    tags: ['restaurants'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID restavracije' }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      required: ['isActive'],
      properties: {
        isActive: { type: 'boolean', description: 'Status restavracije' }
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
    const { isActive } = request.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid restaurant ID'
      });
    }

    if (typeof isActive !== 'boolean') {
      return reply.status(400).send({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!restaurant) {
      return reply.status(404).send({
        success: false,
        message: 'Restaurant not found'
      });
    }

    return {
      success: true,
      message: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: restaurant
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error updating restaurant status',
      error: err.message
    });
  }
});

// DELETE /restaurants/:id - izbriše restavracijo
fastify.delete('/restaurants/:id', {
  schema: {
    description: 'Izbriše restavracijo',
    tags: ['restaurants'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID restavracije' }
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
        message: 'Invalid restaurant ID'
      });
    }

    const restaurant = await Restaurant.findByIdAndDelete(id);

    if (!restaurant) {
      return reply.status(404).send({
        success: false,
        message: 'Restaurant not found'
      });
    }

    return {
      success: true,
      message: 'Restaurant deleted successfully',
      data: restaurant
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error deleting restaurant',
      error: err.message
    });
  }
});

// DELETE /restaurants - izbriše vse restavracije (z opcionalnim filtrom)
fastify.delete('/restaurants', {
  schema: {
    description: 'Izbriše vse restavracije (potrebna potrditev)',
    tags: ['restaurants'],
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
    const { confirm } = request.query;

    if (confirm !== 'true') {
      return reply.status(400).send({
        success: false,
        message: 'Please confirm deletion by adding ?confirm=true to the request'
      });
    }

    const result = await Restaurant.deleteMany({});

    return {
      success: true,
      message: 'All restaurants deleted successfully',
      deletedCount: result.deletedCount
    };
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: 'Error deleting restaurants',
      error: err.message
    });
  }
});

const start = async () => {
  try {
    await connectDB();
    
    const port = process.env.PORT || 3000;
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