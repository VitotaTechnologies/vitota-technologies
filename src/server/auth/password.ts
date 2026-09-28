import argon2 from 'argon2';

export function validatePasswordPolicy(password: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters.');
  if (password.length > 128) errors.push('Password is too long.');
  if (!/[A-Z]/.test(password)) errors.push('Must contain an uppercase letter.');
  if (!/[a-z]/.test(password)) errors.push('Must contain a lowercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Must contain a number.');
  return { ok: errors.length === 0, errors };
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}