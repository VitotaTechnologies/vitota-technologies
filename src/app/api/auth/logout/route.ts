import { invalidateSession, getCurrentUser } from '@/server/auth/session';
import { recordAudit } from '@/server/services/audit';
import { ok, fail } from '@/lib/api-response';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) await recordAudit({ actorId: user.id, action: 'LOGOUT', entityType: 'User', entityId: user.id });
    await invalidateSession();
    return ok({ loggedOut: true });
  } catch (err) {
    return fail(err);
  }
}