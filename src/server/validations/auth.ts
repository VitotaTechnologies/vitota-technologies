import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number'),
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(1),
});

export const otpVerifySchema = z.object({
  identifier: z.string().trim().min(3),
  otp: z.string().regex(/^\d{6}$/),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET']),
});

export const otpSendSchema = z.object({
  identifier: z.string().trim().min(3),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PHONE_VERIFICATION']),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(3),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().trim().min(3),
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
