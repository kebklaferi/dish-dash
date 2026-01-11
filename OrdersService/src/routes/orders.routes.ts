import { Router } from "express";
import ordersController from "../controllers/orders.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @openapi
 * /orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get orders
 *     description: Get all orders for authenticated user. Admins can see all orders.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, out_for_delivery, delivered, cancelled]
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error
 */
router.get("/", ordersController.getAllOrders.bind(ordersController));

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order by ID
 *     description: Retrieve a specific order by its unique ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID (UUID)
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order ID
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", ordersController.getOrderById.bind(ordersController));

/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order
 *     description: Create a new food delivery order for the authenticated user. Restaurant and menu items are validated against hardcoded data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - deliveryAddress
 *               - items
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 example: rest_001
 *               deliveryAddress:
 *                 type: string
 *                 example: 123 Main St, Apt 4B
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - menuItemId
 *                     - name
 *                     - quantity
 *                     - price
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                       example: menu_001
 *                     name:
 *                       type: string
 *                       example: Margherita Pizza
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 12.99
 *                     specialInstructions:
 *                       type: string
 *                       example: Extra cheese
 *               deliveryFee:
 *                 type: number
 *                 format: float
 *                 example: 5.99
 *               notes:
 *                 type: string
 *                 example: Please ring the doorbell
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request - missing required fields or invalid restaurant/menu items
 *       500:
 *         description: Internal server error
 */
router.post("/", ordersController.createOrder.bind(ordersController));

/**
 * @openapi
 * /orders/{id}:
 *   put:
 *     tags:
 *       - Orders
 *     summary: Update order
 *     description: Update an existing order's details, items, or status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryAddress:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, out_for_delivery, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request body or order ID
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", adminMiddleware, ordersController.updateOrder.bind(ordersController));

/**
 * @openapi
 * /orders/{id}:
 *   delete:
 *     tags:
 *       - Orders
 *     summary: Delete order
 *     description: Permanently delete an order and all its items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID (UUID)
 *     responses:
 *       204:
 *         description: Order deleted successfully (no content)
 *       400:
 *         description: Invalid order ID
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", adminMiddleware, ordersController.deleteOrder.bind(ordersController));

/**
 * @openapi
 * /orders/me/recent:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get my recent orders
 *     description: Retrieve the most recent orders for the authenticated user
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of orders to return
 *     responses:
 *       200:
 *         description: List of recent orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/me/recent",
  ordersController.getCustomerRecentOrders.bind(ordersController)
);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Cancel an order
 *     description: Cancel an order by changing its status to cancelled. Cannot cancel delivered or already cancelled orders.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID (UUID)
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot cancel order (already delivered/cancelled)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/cancel",
  ordersController.cancelOrder.bind(ordersController)
);

/**
 * @openapi
 * /orders/{id}/status:
 *   put:
 *     tags:
 *       - Orders
 *     summary: Update order status
 *     description: Update only the status of an order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, out_for_delivery, delivered, cancelled]
 *                 example: preparing
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request - missing status field
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/status",
  adminMiddleware,
  ordersController.updateOrderStatus.bind(ordersController)
);

/**
 * @openapi
 * /orders/me:
 *   delete:
 *     tags:
 *       - Orders
 *     summary: Delete all my orders
 *     description: Permanently delete all orders for the authenticated user
 *     responses:
 *       200:
 *         description: All user orders deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully deleted 5 order(s)
 *                 deletedCount:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/me",
  ordersController.deleteCustomerOrders.bind(ordersController)
);

export default router;
