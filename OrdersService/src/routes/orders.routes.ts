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
 *     description: |
 *       Create a new food delivery order. Menu item details (name, price) are automatically fetched from CatalogService.
 *       
 *       **Payment Processing (Required):**
 *       - If `payment.method` is `CREDIT_CARD`: Order is sent to PaymentService via RabbitMQ for processing. Order status will be updated based on payment result.
 *       - If `payment.method` is `CASH_ON_DELIVERY`: Order is confirmed immediately without payment processing.
 *       
 *       **Note:** Payment information is mandatory. You must specify either CREDIT_CARD or CASH_ON_DELIVERY.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *           examples:
 *             creditCard:
 *               summary: Order with credit card payment
 *               value:
 *                 restaurantId: "1"
 *                 deliveryAddress: "123 Main St, Apt 4B"
 *                 items:
 *                   - menuItemId: "1"
 *                     quantity: 2
 *                     specialInstructions: "Extra cheese, no onions"
 *                 deliveryFee: 5.99
 *                 notes: "Please ring the doorbell"
 *                 payment:
 *                   method: "CREDIT_CARD"
 *                   cardNumber: "4242424242424242"
 *                   expiryMonth: "12"
 *                   expiryYear: "25"
 *                   cvv: "123"
 *                   cardholderName: "John Doe"
 *             cashOnDelivery:
 *               summary: Order with cash on delivery
 *               value:
 *                 restaurantId: "1"
 *                 deliveryAddress: "123 Main St, Apt 4B"
 *                 items:
 *                   - menuItemId: "1"
 *                     quantity: 2
 *                     specialInstructions: "No onions please"
 *                 deliveryFee: 5.99
 *                 notes: "Call when you arrive"
 *                 payment:
 *                   method: "CASH_ON_DELIVERY"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request - missing required fields, invalid menu items, or missing/invalid payment information
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
 *     description: Update an existing order's details, items, or status (Admin only)
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
 *                 example: 456 Oak Ave
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - menuItemId
 *                     - quantity
 *                   properties:
 *                     menuItemId:
 *                       type: integer
 *                       example: 2
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *                     specialInstructions:
 *                       type: string
 *                       example: Well done
 *               notes:
 *                 type: string
 *                 example: Updated delivery instructions
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
 *       403:
 *         description: Access denied
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
 *     description: Permanently delete an order and all its items (Admin only)
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
 *       403:
 *         description: Access denied
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
 *       403:
 *         description: Access denied
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
 *     description: Update only the status of an order (Admin only)
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
 *       403:
 *         description: Access denied
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
