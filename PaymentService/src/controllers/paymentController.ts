import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService.js';
import { createPaymentSchema, paymentIdSchema, orderIdSchema } from '../types/schemas.js';

export class PaymentController {
  /**
   * Create a new payment
   * POST /api/payments
   */
  async createPayment(req: Request, res: Response) {
    try {
      const validatedData = createPaymentSchema.parse(req.body);
      const payment = await paymentService.createPayment(validatedData);

      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create payment',
      });
    }
  }

  /**
   * Process a payment
   * POST /api/payments/:id/process
   */
  async processPayment(req: Request, res: Response) {
    try {
      const { id } = paymentIdSchema.parse(req.params);
      const result = await paymentService.processPayment(id);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.payment,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message,
        });
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to process payment',
      });
    }
  }

  /**
   * Get payment by ID
   * GET /api/payments/:id
   */
  async getPayment(req: Request, res: Response) {
    try {
      const { id } = paymentIdSchema.parse(req.params);
      const payment = await paymentService.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get payment',
      });
    }
  }

  /**
   * Get payments by order ID
   * GET /api/payments/order/:orderId
   */
  async getPaymentsByOrder(req: Request, res: Response) {
    try {
      const { orderId } = orderIdSchema.parse(req.params);
      const payments = await paymentService.getPaymentsByOrderId(orderId);

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get payments',
      });
    }
  }

  /**
   * Get payment history
   * GET /api/payments/:id/history
   */
  async getPaymentHistory(req: Request, res: Response) {
    try {
      const { id } = paymentIdSchema.parse(req.params);
      const history = await paymentService.getPaymentHistory(id);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get payment history',
      });
    }
  }

  /**
   * Refund a payment
   * POST /api/payments/:id/refund
   */
  async refundPayment(req: Request, res: Response) {
    try {
      const { id } = paymentIdSchema.parse(req.params);
      const payment = await paymentService.refundPayment(id);

      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment refunded successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to refund payment',
      });
    }
  }
}

export const paymentController = new PaymentController();
