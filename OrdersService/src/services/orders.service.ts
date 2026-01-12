import prisma from "../db/pool.js";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderStatus,
} from "../types/order.js";
import { getRestaurantById, getMenuItemById } from "../data/hardcoded.js";
import { MenuApi } from "../clients/catalog/api.js";
import { Configuration } from "../clients/catalog/configuration.js";
import { da } from "zod/v4/locales";

export class OrdersService {

  private catalogClient: MenuApi;
  constructor() {
    this.catalogClient = new MenuApi(
      new Configuration({ basePath: process.env.CATALOG_SERVICE_URL || "http://localhost:8080", })
    );
  }

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
    const menuItems = await this.catalogClient.apiCatalogGet({
      restaurantId: data.restaurantId,
    });

    const catalogItems = menuItems.data;

    // Validate menu items (using hardcoded data)
    const enrichedItems = data.items.map((item) => {
      const menuItem = catalogItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      if (!menuItem.available) {
        throw new Error(
          `Menu item ${item.menuItemId} is not available`
        );
      }
      return {
        menuItemId: String(menuItem.id),
        name: menuItem.item_name ?? "Unknown Item",
        quantity: item.quantity,
        price: menuItem.price_cents || 0,
      };


    });

    // Calculate total amount
    const itemsTotal = enrichedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = data.deliveryFee ?? 5.99;
    const totalAmount = itemsTotal + deliveryFee;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        restaurantId: String(data.restaurantId),
        deliveryAddress: data.deliveryAddress,
        totalAmount,
        deliveryFee,
        notes: data.notes ?? null,
        status: "pending",
        items: {
          create: enrichedItems,
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
    let enrichedItems;

    if (data.items) {
      // Delete existing items
      const menuItems = await this.catalogClient.apiCatalogGet({
      restaurantId: data.restaurantId,
    });

    const catalogItems = menuItems.data;

    // Validate menu items (using hardcoded data)
    enrichedItems = data.items.map((item) => {
      const menuItem = catalogItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      if (!menuItem.available) {
        throw new Error(
          `Menu item ${item.menuItemId} is not available`
        );
      }
      return {
        menuItemId: String(menuItem.id),
        name: menuItem.item_name ?? "Unknown Item",
        quantity: item.quantity,
        price: menuItem.price_cents || 0,
      };
    });

    // Delete existing items
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Calculate new total
      const itemsTotal = enrichedItems.reduce(
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
            create: enrichedItems,
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

  // GET - Get customer's recent orders
  async getCustomerRecentOrders(
    customerId: string,
    limit: number = 10
  ): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return orders as Order[];
  }

  // POST - Cancel an order
  async cancelOrder(id: string): Promise<Order> {
    const existingOrder = await this.getOrderById(id);
    if (!existingOrder) {
      throw new Error(`Order ${id} not found`);
    }

    if (existingOrder.status === "delivered") {
      throw new Error("Cannot cancel a delivered order");
    }

    if (existingOrder.status === "cancelled") {
      throw new Error("Order is already cancelled");
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
      include: {
        items: true,
      },
    });

    return order as Order;
  }

  // PUT - Update order status only
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const existingOrder = await this.getOrderById(id);
    if (!existingOrder) {
      throw new Error(`Order ${id} not found`);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
      },
    });

    return order as Order;
  }

  // DELETE - Delete all orders for a customer
  async deleteCustomerOrders(customerId: string): Promise<number> {
    const result = await prisma.order.deleteMany({
      where: { customerId },
    });

    return result.count;
  }
}

export default new OrdersService();
