import { requireAdmin } from '@/server/auth/authorization';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export default async function AuditLogsPage() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
    include: {
      actor: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Track important administrative and security activities.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-text-secondary">
            No audit logs available yet.
          </p>
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-border bg-surface/50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                    Date
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                    User
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                    Action
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                    Entity
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                    Entity ID
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border last:border-0 hover:bg-surface/30"
                  >
                    <td className="px-4 py-4 text-text-secondary">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="px-4 py-4">
                      {log.actor ? (
                        <div>
                          <div className="font-medium text-text-primary">
                            {log.actor.name}
                          </div>

                          <div className="text-xs text-text-muted">
                            {log.actor.email}
                          </div>

                          <div className="mt-1 text-xs text-primary">
                            {log.actor.role}
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-muted">
                          System
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-text-secondary">
                      {log.entityType || '—'}
                    </td>

                    <td className="max-w-[180px] truncate px-4 py-4 font-mono text-xs text-text-muted">
                      {log.entityId || '—'}
                    </td>

                    <td className="px-4 py-4">
                      {log.metadata ? (
                        <details className="max-w-[280px]">
                          <summary className="cursor-pointer text-xs text-primary hover:underline">
                            View details
                          </summary>

                          <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-background p-3 text-[11px] text-text-secondary">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}