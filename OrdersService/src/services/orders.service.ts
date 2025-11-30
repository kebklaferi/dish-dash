import prisma from "../db/pool.js";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderStatus,
} from "../types/order.js";
import { getRestaurantById, getMenuItemById } from "../data/hardcoded.js";

export class OrdersService {
  // GET - Get all orders
  async getAllOrders(
    filters?: { status?: OrderStatus; customerId?: string }
  ): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.customerId && { customerId: filters.customerId }),
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders as Order[];
  }

  // GET - Get order by ID
  async getOrderById(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return order as Order | null;
  }

  // POST - Create new order
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    // Validate restaurant exists (using hardcoded data)
    const restaurant = getRestaurantById(data.restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurant ${data.restaurantId} not found`);
    }

    // Validate menu items (using hardcoded data)
    for (const item of data.items) {
      const menuItem = getMenuItemById(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      if (menuItem.restaurantId !== data.restaurantId) {
        throw new Error(
          `Menu item ${item.menuItemId} does not belong to restaurant ${data.restaurantId}`
        );
      }
    }

    // Calculate total amount
    const itemsTotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = data.deliveryFee ?? 5.99;
    const totalAmount = itemsTotal + deliveryFee;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        restaurantId: data.restaurantId,
        deliveryAddress: data.deliveryAddress,
        totalAmount,
        deliveryFee,
        notes: data.notes ?? null,
        status: "pending",
        items: {
          create: data.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            specialInstructions: item.specialInstructions ?? null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return order as Order;
  }

  // PUT - Update order
  async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
    const existingOrder = await this.getOrderById(id);
    if (!existingOrder) {
      throw new Error(`Order ${id} not found`);
    }

    // If updating items, recalculate total
    let totalAmount = existingOrder.totalAmount;
    if (data.items) {
      // Delete existing items
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Calculate new total
      const itemsTotal = data.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      totalAmount = itemsTotal + existingOrder.deliveryFee;
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(data.deliveryAddress && { deliveryAddress: data.deliveryAddress }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status && { status: data.status }),
        ...(data.items && { totalAmount }),
        ...(data.items && {
          items: {
            create: data.items.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              specialInstructions: item.specialInstructions ?? null,
            })),
          },
        }),
      },
      include: {
        items: true,
      },
    });

    return order as Order;
  }

  // DELETE - Delete order
  async deleteOrder(id: string): Promise<void> {
    const existingOrder = await this.getOrderById(id);
    if (!existingOrder) {
      throw new Error(`Order ${id} not found`);
    }

    await prisma.order.delete({
      where: { id },
    });
  }
}

export default new OrdersService();
