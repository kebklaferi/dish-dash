import type { Request, Response, NextFunction } from "express";
import ordersService from "../services/orders.service.js";
import type { CreateOrderRequest, UpdateOrderRequest } from "../types/order.js";

export class OrdersController {
  // GET /orders - Get all orders (user's own orders or all if admin)
  async getAllOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status } = req.query;
      const isAdmin = req.user!.role === 'ADMIN';
      
      // Build filter object - only include customerId if not admin
      const filter: { status?: any; customerId?: string } = {
        status: status as any,
      };
      
      if (!isAdmin) {
        filter.customerId = req.user!.id;
      }

      const orders = await ordersService.getAllOrders(filter);

      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  // GET /orders/:id - Get order by ID
  async getOrderById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "Order ID is required" });
        return;
      }

      const order = await ordersService.getOrderById(id);

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      // Check ownership unless admin
      const isAdmin = req.user!.role === 'ADMIN';
      if (!isAdmin && order.customerId !== req.user!.id) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

  // POST /orders - Create new order
  async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const orderData: CreateOrderRequest = {
        ...req.body,
        customerId: req.user!.id, // Use authenticated user's ID
      };

      // Basic validation
      if (
        !orderData.restaurantId ||
        !orderData.deliveryAddress ||
        !orderData.items ||
        orderData.items.length === 0
      ) {
        res.status(400).json({
          error:
            "Missing required fields: restaurantId, deliveryAddress, items",
        });
        return;
      }

      const order = await ordersService.createOrder(orderData);

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  // PUT /orders/:id - Update order
  async updateOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateOrderRequest = req.body;

      if (!id) {
        res.status(400).json({ error: "Order ID is required" });
        return;
      }

      const order = await ordersService.updateOrder(id, updateData);

      res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  // DELETE /orders/:id - Delete order
  async deleteOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "Order ID is required" });
        return;
      }

      await ordersService.deleteOrder(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  // GET /orders/me/recent - Get authenticated user's recent orders
  async getCustomerRecentOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.user!.id; // Use authenticated user's ID
      const limit = parseInt(req.query.limit as string) || 10;

      const orders = await ordersService.getCustomerRecentOrders(
        customerId,
        limit
      );

      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  // POST /orders/:id/cancel - Cancel an order
  async cancelOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "Order ID is required" });
        return;
      }

      // Check ownership before canceling
      const existingOrder = await ordersService.getOrderById(id);
      if (!existingOrder) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      const isAdmin = req.user!.role === 'ADMIN';
      if (!isAdmin && existingOrder.customerId !== req.user!.id) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const order = await ordersService.cancelOrder(id);

      res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        next(error);
      }
    }
  }

  // PUT /orders/:id/status - Update order status
  async updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        res.status(400).json({ error: "Order ID is required" });
        return;
      }

      if (!status) {
        res.status(400).json({ error: "Status is required" });
        return;
      }

      const order = await ordersService.updateOrderStatus(id, status);

      res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  // DELETE /orders/me - Delete all authenticated user's orders
  async deleteCustomerOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.user!.id; // Use authenticated user's ID

      const count = await ordersService.deleteCustomerOrders(customerId);

      res.status(200).json({ 
        message: `Successfully deleted ${count} order(s)`,
        deletedCount: count 
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrdersController();
