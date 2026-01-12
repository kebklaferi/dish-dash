import { z } from 'zod';

export const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('EUR'),
  paymentMethod: z.enum(['CARD', 'CREDIT_CARD']),
  cardNumber: z.string().regex(/^\d{16}$/),
  cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cardCvv: z.string().regex(/^\d{3,4}$/),
  cardholderName: z.string().min(1)
});

export const paymentIdSchema = z.object({
  id: z.string().uuid()
});

export const orderIdSchema = z.object({
  orderId: z.string().uuid()
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentIdInput = z.infer<typeof paymentIdSchema>;
export type OrderIdInput = z.infer<typeof orderIdSchema>;
