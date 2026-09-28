'use client';

import { useEffect, useState } from 'react';

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  client: {
    id: string;
    companyName: string | null;
    isActive: boolean;
  } | null;
};

type ActionType = 'BLOCK' | 'UNBLOCK';

export default function DangerZonePage() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [action, setAction] =
    useState<ActionType | null>(null);

  const [challenge, setChallenge] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [processing, setProcessing] = useState(false);

  async function unlockDangerZone() {
    if (!password.trim()) {
      setError('Danger Zone password is required.');
      return;
    }

    setUnlocking(true);
    setError('');

    try {
      const response = await fetch(
        '/api/admin/danger-zone/unlock',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error?.message ||
            'Unable to unlock Danger Zone.'
        );
      }

      setUnlocked(true);
      setPassword('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to unlock Danger Zone.'
      );
    } finally {
      setUnlocking(false);
    }
  }

  async function loadClients() {
    if (!unlocked) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/admin/danger-zone/clients?q=${encodeURIComponent(
          search
        )}`,
        {
          cache: 'no-store',
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error?.message ||
            'Unable to load clients.'
        );
      }

      setClients(data.data || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load clients.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!unlocked) return;

    const timer = setTimeout(() => {
      loadClients();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, unlocked]);

  async function startAction(
    client: Client,
    nextAction: ActionType
  ) {
    setSelectedClient(client);
    setAction(nextAction);
    setProcessing(true);
    setError('');

    try {
      const response = await fetch(
        `/api/admin/danger-zone/clients/${client.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: nextAction,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error?.message ||
            'Unable to start confirmation.'
        );
      }

      setChallenge(data.data.challenge);
      setSeconds(5);
    } catch (error) {
      setSelectedClient(null);
      setAction(null);

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to start action.'
      );
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  async function confirmAction() {
    if (
      !selectedClient ||
      !action ||
      !challenge ||
      seconds > 0
    ) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await fetch(
        `/api/admin/danger-zone/clients/${selectedClient.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            confirmToken: challenge,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error?.message ||
            'Action failed.'
        );
      }

      setSelectedClient(null);
      setAction(null);
      setChallenge('');
      setSeconds(0);

      await loadClients();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Action failed.'
      );
    } finally {
      setProcessing(false);
    }
  }

  function cancelAction() {
    if (processing) return;

    setSelectedClient(null);
    setAction(null);
    setChallenge('');
    setSeconds(0);
  }

  /*
   * LOCKED SCREEN
   */
  if (!unlocked) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-danger">
            Danger Zone
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Restricted area for Super Admin only.
          </p>
        </div>

        <div className="glass rounded-2xl border border-danger/30 p-6">
          <div className="mb-5 rounded-xl border border-danger/20 bg-danger/5 p-4">
            <p className="font-semibold text-danger">
              Restricted Area
            </p>

            <p className="mt-1 text-sm text-text-secondary">
              Blocking a client does not delete
              their data. The account can be
              unblocked later.
            </p>
          </div>

          <label className="mb-2 block text-sm font-medium">
            Danger Zone Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                unlockDangerZone();
              }
            }}
            placeholder="Enter Danger Zone password"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-danger"
          />

          {error && (
            <p className="mt-3 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={unlockDangerZone}
            disabled={unlocking}
            className="mt-4 w-full rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {unlocking
              ? 'Unlocking...'
              : 'Unlock Danger Zone'}
          </button>
        </div>
      </div>
    );
  }

  /*
   * UNLOCKED SCREEN
   */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-danger">
          Danger Zone
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Search, block, or unblock client accounts.
        </p>
      </div>

      {/* WARNING */}
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5">
        <p className="font-semibold text-danger">
          Important
        </p>

        <p className="mt-1 text-sm text-text-secondary">
          Blocking a client only deactivates the
          account. The client's existing data will
          remain safely stored.
        </p>
      </div>

      {/* SEARCH */}
      <div className="glass rounded-2xl p-5">
        <label className="mb-2 block text-sm font-medium">
          Search Client
        </label>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by name, email, or phone number..."
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary"
        />

        <p className="mt-2 text-xs text-text-muted">
          Enter any one of the client's name,
          email address, or phone number.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="rounded-xl border border-border bg-surface p-5 text-sm text-text-secondary">
          Searching clients...
        </div>
      )}

      {/* EMPTY */}
      {!loading && clients.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-semibold">
            No client found
          </p>

          <p className="mt-1 text-sm text-text-secondary">
            Try another name, email address, or
            phone number.
          </p>
        </div>
      )}

      {/* CLIENT LIST */}
      <div className="space-y-4">
        {clients.map((client) => {
          const blocked =
            client.status === 'DEACTIVATED';

          return (
            <div
              key={client.id}
              className={`glass rounded-2xl border p-5 ${
                blocked
                  ? 'border-danger/30'
                  : 'border-border'
              }`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-text-primary">
                      {client.name}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        blocked
                          ? 'bg-danger/10 text-danger'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      {blocked
                        ? 'BLOCKED'
                        : 'ACTIVE'}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-text-secondary">
                    {client.email}
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    {client.phone ||
                      'No phone number'}
                  </p>

                  {client.client?.companyName && (
                    <p className="mt-1 text-xs text-text-muted">
                      {client.client.companyName}
                    </p>
                  )}
                </div>

                {/* ONE BUTTON */}
                <button
                  type="button"
                  disabled={processing}
                  onClick={() =>
                    startAction(
                      client,
                      blocked
                        ? 'UNBLOCK'
                        : 'BLOCK'
                    )
                  }
                  className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
                    blocked
                      ? 'bg-success'
                      : 'bg-danger'
                  }`}
                >
                  {blocked
                    ? 'UNBLOCK CLIENT'
                    : 'BLOCK CLIENT'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION MODAL */}
      {selectedClient && action && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background-secondary p-6 shadow-2xl">
            <h2
              className={`text-xl font-bold ${
                action === 'BLOCK'
                  ? 'text-danger'
                  : 'text-success'
              }`}
            >
              {action === 'BLOCK'
                ? 'Block Client?'
                : 'Unblock Client?'}
            </h2>

            <p className="mt-3 text-sm text-text-secondary">
              Are you sure you want to{' '}
              {action === 'BLOCK'
                ? 'block'
                : 'unblock'}{' '}
              <span className="font-semibold text-text-primary">
                {selectedClient.name}
              </span>
              ?
            </p>

            {action === 'BLOCK' && (
              <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-text-secondary">
                The account will be blocked,
                but all existing client data will
                remain safely stored.
              </div>
            )}

            {action === 'UNBLOCK' && (
              <div className="mt-4 rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-text-secondary">
                The account will be restored.
                Existing client data will remain
                unchanged.
              </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-center">
              {seconds > 0 ? (
                <>
                  <p className="text-sm text-text-secondary">
                    Please wait before final
                    confirmation.
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {seconds}
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium">
                  Confirmation is ready.
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={cancelAction}
                disabled={processing}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmAction}
                disabled={
                  processing || seconds > 0
                }
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  action === 'BLOCK'
                    ? 'bg-danger'
                    : 'bg-success'
                }`}
              >
                {processing
                  ? 'Processing...'
                  : action === 'BLOCK'
                    ? 'Confirm Block'
                    : 'Confirm Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}