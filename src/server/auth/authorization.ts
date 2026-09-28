import { getCurrentUser, type SessionUser } from './session';
import { Errors } from '@/lib/errors';
import type { Role } from '@prisma/client';

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw Errors.unauthorized();
  if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') throw Errors.forbidden();
  return user;
}

export async function requireActiveUser(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.status !== 'ACTIVE') throw Errors.forbidden();
  return user;
}

export async function requireRole(allowed: Role[]): Promise<SessionUser> {
  const user = await requireActiveUser();
  if (!allowed.includes(user.role)) throw Errors.forbidden();
  return user;
}

export const requireAdmin = () => requireRole(['SUPER_ADMIN', 'ADMIN', 'STAFF']);
export const requireSuperAdmin = () => requireRole(['SUPER_ADMIN']);
export const requireClient = () => requireRole(['CLIENT']);

export function canManage(role: Role): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}