import { Router } from "express";
import ordersController from "../controllers/orders.controller.js";

const router = Router();

/**
 * @openapi
 * /orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders
 *     description: Retrieve a list of all orders with optional filtering
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, out_for_delivery, delivered, cancelled]
 *         description: Filter orders by status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filter orders by customer ID
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
 *     description: Create a new food delivery order. Restaurant and menu items are validated against hardcoded data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - restaurantId
 *               - deliveryAddress
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: customer_123
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
router.put("/:id", ordersController.updateOrder.bind(ordersController));

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
router.delete("/:id", ordersController.deleteOrder.bind(ordersController));

export default router;
