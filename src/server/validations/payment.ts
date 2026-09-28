import { z } from 'zod';

export const manualPaymentSchema = z.object({
  projectId: z.string().cuid(),
  amount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).default('INR'),
  method: z.string().trim().max(60).optional(),
  reference: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
  status: z.enum(['PENDING', 'PAID']).default('PAID'),
});