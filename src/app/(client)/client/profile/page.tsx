export default function ClientProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your account profile and personal information.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Profile</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-text-muted">Name</label>
            <p className="mt-1 font-medium">My Account</p>
          </div>

          <div>
            <label className="text-sm text-text-muted">Account Status</label>
            <p className="mt-1 font-medium">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}