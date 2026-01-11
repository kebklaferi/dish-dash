import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create and process a payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *               - paymentMethod
 *               - cardNumber
 *               - cardExpiry
 *               - cardCvv
 *               - cardholderName
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: EUR
 *               paymentMethod:
 *                 type: string
 *                 enum: [CARD]
 *               cardNumber:
 *                 type: string
 *               cardExpiry:
 *                 type: string
 *               cardCvv:
 *                 type: string
 *               cardholderName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created and processed successfully
 */
router.post('/', paymentController.createPayment.bind(paymentController));

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 */
router.get('/:id', paymentController.getPayment.bind(paymentController));

/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     summary: Get payments by order ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of payments for the order
 */
router.get('/order/:orderId', paymentController.getPaymentsByOrder.bind(paymentController));

/**
 * @swagger
 * /api/payments/{id}/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment history
 */
router.get('/:id/history', paymentController.getPaymentHistory.bind(paymentController));

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Refund a payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 */
router.post('/:id/refund', adminMiddleware, paymentController.refundPayment.bind(paymentController));

export default router;
