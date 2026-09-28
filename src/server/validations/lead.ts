import { z } from 'zod';

export const leadCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),

  email: z.string().trim().toLowerCase().email(),

  phone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/),

  service: z.string().trim().max(120).optional(),

  message: z.string().trim().min(10).max(5000),

  urgent: z.coerce.boolean().default(false),
});

export const leadStatusUpdateSchema = z.object({
  status: z.enum([
    'NEW',
    'CONTACTED',
    'DISCUSSION',
    'PROPOSAL',
    'CONVERTED',
    'CLOSED',
  ]),
});

export const leadNoteSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});