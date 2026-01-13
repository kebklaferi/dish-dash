import { Router } from "express";
import { logsController } from "../controllers/logsController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /logs/save:
 *   post:
 *     summary: Save all logs from RabbitMQ to database
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logs saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 saved:
 *                   type: number
 *                 errors:
 *                   type: number
 */
router.post("/save", authMiddleware, logsController.saveLogs.bind(logsController));

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get logs between dates
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date (ISO 8601 format)
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [Info, Error, Warn]
 *         description: Filter by log level
 *       - in: query
 *         name: correlationId
 *         schema:
 *           type: string
 *         description: Filter by correlation ID
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/", authMiddleware, logsController.getLogs.bind(logsController));

/**
 * @swagger
 * /logs:
 *   delete:
 *     summary: Delete all logs from database
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All logs deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 */
router.delete("/", authMiddleware, logsController.deleteLogs.bind(logsController));

export default router;
