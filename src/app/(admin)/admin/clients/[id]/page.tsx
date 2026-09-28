import { requireAdmin } from '@/server/auth/authorization';

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Client Details</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Client information and account details.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <p className="text-sm text-text-secondary">
          Client ID: <span className="text-text-primary">{params.id}</span>
        </p>
      </div>
    </div>
  );
}