import { z } from 'zod';

export const projectCreateSchema = z.object({
  clientId: z.string().cuid(),
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional(),
  totalCost: z.coerce.number().nonnegative(),
  currency: z.string().trim().length(3).default('INR'),
  startDate: z.string().datetime().optional(),
  expectedEnd: z.string().datetime().optional(),
});

export const projectUpdateSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(['PLANNING', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT', 'COMPLETED', 'ON_HOLD']).optional(),
  phase: z.string().trim().max(60).optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  totalCost: z.coerce.number().nonnegative().optional(),
  expectedEnd: z.string().datetime().optional(),
});

export const milestoneCreateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  order: z.coerce.number().int().min(0).default(0),
  dueDate: z.string().datetime().optional(),
});

export const milestoneUpdateSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.string().datetime().optional(),
});