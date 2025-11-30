import type { Request, Response, NextFunction } from "express";
import ordersService from "../services/orders.service.js";
import type { CreateOrderRequest, UpdateOrderRequest } from "../types/order.js";

export class OrdersController {
  // GET /orders - Get all orders
  async getAllOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status, customerId } = req.query;

      const orders = await ordersService.getAllOrders({
        status: status as any,
        customerId: customerId as string,
      });

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
      const orderData: CreateOrderRequest = req.body;

      // Basic validation
      if (
        !orderData.customerId ||
        !orderData.restaurantId ||
        !orderData.deliveryAddress ||
        !orderData.items ||
        orderData.items.length === 0
      ) {
        res.status(400).json({
          error:
            "Missing required fields: customerId, restaurantId, deliveryAddress, items",
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
}

export default new OrdersController();
