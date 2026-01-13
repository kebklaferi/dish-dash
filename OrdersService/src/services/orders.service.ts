import prisma from "../db/pool.js";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderStatus,
} from "../types/order.js";
import { MenuApi } from "../clients/catalog/api.js";
import { Configuration } from "../clients/catalog/configuration.js";
import axios from "axios";

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
    try {
      console.log('[OrdersService] Fetching all orders with filters:', filters);
      
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

      console.log(`[OrdersService] Found ${orders.length} orders`);
      return orders as Order[];
    } catch (error) {
      console.error('[OrdersService] Error in getAllOrders:', error);
      throw new Error(`Failed to fetch orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // GET - Get order by ID
  async getOrderById(id: string): Promise<Order | null> {
    try {
      console.log(`[OrdersService] Fetching order: ${id}`);
      
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (order) {
        console.log(`[OrdersService] Order found: ${id}`);
      } else {
        console.log(`[OrdersService] Order not found: ${id}`);
      }

      return order as Order | null;
    } catch (error) {
      console.error(`[OrdersService] Error in getOrderById(${id}):`, error);
      throw new Error(`Failed to fetch order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // POST - Create new order
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    console.log('[OrdersService] Creating order:', JSON.stringify(data, null, 2));
    
    try {
      // Validate input
      if (!data.restaurantId || !data.deliveryAddress || !data.items || data.items.length === 0) {
        throw new Error('Missing required fields: restaurantId, deliveryAddress, and items are required');
      }

      console.log(`[OrdersService] Fetching menu items for restaurant ${data.restaurantId}`);
      
      let menuItems;
      try {
        menuItems = await this.catalogClient.apiCatalogGet({
          restaurantId: data.restaurantId,
        });
        console.log(`[OrdersService] Received ${menuItems.data.length} menu items from CatalogService`);
      } catch (catalogError) {
        console.error('[OrdersService] CatalogService request failed:', catalogError);
        
        if (axios.isAxiosError(catalogError)) {
          if (catalogError.response) {
            throw new Error(`CatalogService error (${catalogError.response.status}): ${JSON.stringify(catalogError.response.data)}`);
          } else if (catalogError.request) {
            throw new Error('CatalogService is unreachable - check if service is running');
          }
        }
        throw new Error(`Failed to fetch menu items: ${catalogError}`);
      }

      const catalogItems = menuItems.data;

      if (!catalogItems || catalogItems.length === 0) {
        throw new Error(`No menu items found for restaurant ${data.restaurantId}`);
      }

      // Validate and enrich menu items
      console.log('[OrdersService] Validating and enriching order items...');
      const enrichedItems = data.items.map((item, index) => {
        // Convert menuItemId to number for comparison since catalog returns numeric IDs
        const menuItemId = typeof item.menuItemId === 'string' ? parseInt(item.menuItemId, 10) : item.menuItemId;
        const menuItem = catalogItems.find((m) => m.id === menuItemId);
        
        if (!menuItem) {
          console.error(`[OrdersService] Menu item ${item.menuItemId} not found`);
          throw new Error(`Menu item ${item.menuItemId} not found in restaurant ${data.restaurantId}`);
        }
        
        if (!menuItem.available) {
          throw new Error(`Menu item "${menuItem.item_name || menuItem.item_name}" is not available`);
        }

        if (menuItem.id === undefined) {
          throw new Error('Menu item has no ID');
        }

        return {
          menuItemId: String(menuItem.id),
          name: menuItem.item_name ?? menuItem.item_name ?? "Unknown Item",
          quantity: item.quantity,
          price: menuItem.price_cents ?? menuItem.price_cents ?? 0,
        };
      });

      console.log('[OrdersService] All items validated');

      // Calculate total amount
      const itemsTotal = enrichedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const deliveryFee = data.deliveryFee ?? 599; // 5.99 in cents
      const totalAmount = itemsTotal + deliveryFee;

      console.log(`[OrdersService] Order total: ${(totalAmount / 100).toFixed(2)}`);

      // Create order with items
      console.log('[OrdersService] Creating order in database...');
      const order = await prisma.order.create({
        data: {
          customerId: data.customerId,
          restaurantId: String(data.restaurantId),
          deliveryAddress: data.deliveryAddress,
          totalAmount,
          deliveryFee,
          paymentMethod: data.paymentMethod,
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

      console.log(`[OrdersService] Order created successfully: ${order.id}`);
      return order as Order;

    } catch (error) {
      console.error('[OrdersService] Error in createOrder:', error);
      if (error instanceof Error) {
        console.error('[OrdersService] Error message:', error.message);
      }
      throw error;
    }
  }

  // PUT - Update order
  async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
    console.log(`[OrdersService] Updating order ${id}`);
    
    try {
      const existingOrder = await this.getOrderById(id);
      if (!existingOrder) {
        throw new Error(`Order ${id} not found`);
      }

      // If updating items, recalculate total
      let totalAmount = existingOrder.totalAmount;
      let enrichedItems;

      if (data.items) {
        console.log(`[OrdersService] Fetching menu items for restaurant ${existingOrder.restaurantId}`);
        
        const menuItems = await this.catalogClient.apiCatalogGet({
          restaurantId: Number(existingOrder.restaurantId),
        });

        const catalogItems = menuItems.data;
        console.log(`[OrdersService] Found ${catalogItems.length} catalog items`);

        enrichedItems = data.items.map((item) => {
          const menuItem = catalogItems.find((m) => m.id === item.menuItemId);
          
          if (!menuItem) {
            throw new Error(`Menu item ${item.menuItemId} not found`);
          }
          
          if (!menuItem.available) {
            throw new Error(`Menu item "${menuItem.item_name || menuItem.item_name}" is not available`);
          }

          if (menuItem.id === undefined) {
            throw new Error('Menu item has no ID');
          }

          return {
            menuItemId: String(menuItem.id),
            name: menuItem.item_name ?? menuItem.item_name ?? "Unknown Item",
            quantity: item.quantity,
            price: menuItem.price_cents ?? menuItem.price_cents ?? 0,
          };
        });

        console.log('[OrdersService] Deleting existing items...');
        await prisma.orderItem.deleteMany({
          where: { orderId: id },
        });

        // Calculate new total
        const itemsTotal = enrichedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        totalAmount = itemsTotal + existingOrder.deliveryFee;
        console.log(`[OrdersService] New total: ${(totalAmount / 100).toFixed(2)}`);
      }

      console.log('[OrdersService] Updating order...');
      const order = await prisma.order.update({
        where: { id },
        data: {
          ...(data.deliveryAddress && { deliveryAddress: data.deliveryAddress }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.status && { status: data.status }),
          ...(data.items && { totalAmount }),
          ...(data.items && enrichedItems && {
            items: {
              create: enrichedItems,
            },
          }),
        },
        include: {
          items: true,
        },
      });

      console.log(`[OrdersService] Order updated: ${id}`);
      return order as Order;

    } catch (error) {
      console.error(`[OrdersService] Error in updateOrder(${id}):`, error);
      throw new Error(`Failed to update order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // DELETE - Delete order
  async deleteOrder(id: string): Promise<void> {
    try {
      console.log(`[OrdersService] Deleting order: ${id}`);
      
      const existingOrder = await this.getOrderById(id);
      if (!existingOrder) {
        throw new Error(`Order ${id} not found`);
      }

      await prisma.order.delete({
        where: { id },
      });

      console.log(`[OrdersService] Order deleted: ${id}`);
    } catch (error) {
      console.error(`[OrdersService] Error in deleteOrder(${id}):`, error);
      throw new Error(`Failed to delete order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // GET - Get customer's recent orders
  async getCustomerRecentOrders(
    customerId: string,
    limit: number = 10
  ): Promise<Order[]> {
    try {
      console.log(`[OrdersService] Fetching recent orders for customer ${customerId}`);
      
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

      console.log(`[OrdersService] Found ${orders.length} recent orders`);
      return orders as Order[];
    } catch (error) {
      console.error(`[OrdersService] Error in getCustomerRecentOrders(${customerId}):`, error);
      throw new Error(`Failed to fetch recent orders for customer ${customerId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // POST - Cancel an order
  async cancelOrder(id: string): Promise<Order> {
    try {
      console.log(`[OrdersService] Cancelling order: ${id}`);
      
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

      console.log(`[OrdersService] Order cancelled: ${id}`);
      return order as Order;
    } catch (error) {
      console.error(`[OrdersService] Error in cancelOrder(${id}):`, error);
      throw new Error(`Failed to cancel order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // PUT - Update order status only
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      console.log(`[OrdersService] Updating status for order ${id} to: ${status}`);
      
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

      console.log(`[OrdersService] Status updated: ${id} -> ${status}`);
      return order as Order;
    } catch (error) {
      console.error(`[OrdersService] Error in updateOrderStatus(${id}):`, error);
      throw new Error(`Failed to update order status for ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // DELETE - Delete all orders for a customer
  async deleteCustomerOrders(customerId: string): Promise<number> {
    try {
      console.log(`[OrdersService] Deleting all orders for customer: ${customerId}`);
      
      const result = await prisma.order.deleteMany({
        where: { customerId },
      });

      console.log(`[OrdersService] Deleted ${result.count} orders`);
      return result.count;
    } catch (error) {
      console.error(`[OrdersService] Error in deleteCustomerOrders(${customerId}):`, error);
      throw new Error(`Failed to delete orders for customer ${customerId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new OrdersService();
