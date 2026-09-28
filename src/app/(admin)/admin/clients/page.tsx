'use client';

import { useEffect, useState } from 'react';

import {
  Plus,
  Search,
  Eye,
  Phone,
  Mail,
  ShieldAlert,
  X,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';

import Link from 'next/link';

type Client = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  status: string;
  callEnabled?: boolean;
  createdAt: string;
};

type DangerClient = {
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

type DangerAction =
  | 'BLOCK'
  | 'UNBLOCK';

export default function AdminClientsPage() {
  const [
    clients,
    setClients,
  ] = useState<Client[]>([]);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  /*
   * =========================================================
   * DANGER ZONE STATE
   * =========================================================
   */

  const [
    dangerOpen,
    setDangerOpen,
  ] = useState(false);

  const [
    dangerUnlocked,
    setDangerUnlocked,
  ] = useState(false);

  const [
    dangerPassword,
    setDangerPassword,
  ] = useState('');

  const [
    dangerUnlocking,
    setDangerUnlocking,
  ] = useState(false);

  const [
    dangerError,
    setDangerError,
  ] = useState('');

  const [
    dangerSearch,
    setDangerSearch,
  ] = useState('');

  const [
    dangerClients,
    setDangerClients,
  ] = useState<DangerClient[]>(
    []
  );

  const [
    dangerLoading,
    setDangerLoading,
  ] = useState(false);

  const [
    selectedClient,
    setSelectedClient,
  ] =
    useState<DangerClient | null>(
      null
    );

  const [
    dangerAction,
    setDangerAction,
  ] =
    useState<DangerAction | null>(
      null
    );

  const [
    challenge,
    setChallenge,
  ] = useState('');

  const [
    seconds,
    setSeconds,
  ] = useState(0);

  const [
    dangerProcessing,
    setDangerProcessing,
  ] = useState(false);

  /*
   * =========================================================
   * NORMAL CLIENTS
   * =========================================================
   */

  async function loadClients() {
    setLoading(true);

    try {
      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          'q',
          search.trim()
        );
      }

      const response =
        await fetch(
          `/api/admin/clients?${params.toString()}`,
          {
            cache:
              'no-store',
          }
        );

      const json =
        await response.json();

      if (
        !response.ok ||
        !json.success
      ) {
        throw new Error(
          json.error?.message ||
            'Unable to load clients.'
        );
      }

      const responseData =
        json.data;

      let clientList: Client[] =
        [];

      if (
        Array.isArray(
          responseData
        )
      ) {
        clientList =
          responseData;
      } else if (
        Array.isArray(
          responseData?.items
        )
      ) {
        clientList =
          responseData.items;
      } else if (
        Array.isArray(
          responseData?.data
        )
      ) {
        clientList =
          responseData.data;
      }

      setClients(
        clientList
      );
    } catch (error) {
      console.error(
        'Unable to load clients:',
        error
      );

      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadClients();
      }, 250);

    return () =>
      clearTimeout(timer);
  }, [search]);

  /*
   * =========================================================
   * OPEN DANGER ZONE
   * =========================================================
   */

  function openDangerZone() {
    setDangerOpen(true);
    setDangerUnlocked(false);
    setDangerPassword('');
    setDangerError('');
    setDangerSearch('');
    setDangerClients([]);
    setSelectedClient(null);
    setDangerAction(null);
    setChallenge('');
    setSeconds(0);
  }

  /*
   * =========================================================
   * CLOSE DANGER ZONE
   * =========================================================
   */

  function closeDangerZone() {
    if (dangerProcessing) {
      return;
    }

    setDangerOpen(false);
    setDangerUnlocked(false);
    setDangerPassword('');
    setDangerError('');
    setDangerSearch('');
    setDangerClients([]);
    setSelectedClient(null);
    setDangerAction(null);
    setChallenge('');
    setSeconds(0);
  }

  /*
   * =========================================================
   * UNLOCK DANGER ZONE
   * =========================================================
   */

  async function unlockDangerZone() {
    if (
      !dangerPassword.trim()
    ) {
      setDangerError(
        'Danger Zone password is required.'
      );

      return;
    }

    setDangerUnlocking(
      true
    );

    setDangerError('');

    try {
      const response =
        await fetch(
          '/api/admin/danger-zone/unlock',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              password:
                dangerPassword,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error?.message ||
            'Unable to unlock Danger Zone.'
        );
      }

      setDangerUnlocked(
        true
      );

      setDangerPassword('');
    } catch (error) {
      setDangerError(
        error instanceof Error
          ? error.message
          : 'Unable to unlock Danger Zone.'
      );
    } finally {
      setDangerUnlocking(
        false
      );
    }
  }

  /*
   * =========================================================
   * LOAD DANGER ZONE CLIENTS
   * =========================================================
   */

  async function loadDangerClients() {
    if (!dangerUnlocked) {
      return;
    }

    setDangerLoading(
      true
    );

    setDangerError('');

    try {
      const response =
        await fetch(
          `/api/admin/danger-zone/clients?q=${encodeURIComponent(
            dangerSearch.trim()
          )}`,
          {
            cache:
              'no-store',
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error?.message ||
            'Unable to load clients.'
        );
      }

      const responseData =
        data.data;

      let clientList:
        DangerClient[] =
        [];

      if (
        Array.isArray(
          responseData
        )
      ) {
        clientList =
          responseData;
      } else if (
        Array.isArray(
          responseData?.items
        )
      ) {
        clientList =
          responseData.items;
      } else if (
        Array.isArray(
          responseData?.data
        )
      ) {
        clientList =
          responseData.data;
      }

      setDangerClients(
        clientList
      );
    } catch (error) {
      console.error(
        'Danger Zone client search error:',
        error
      );

      setDangerClients([]);

      setDangerError(
        error instanceof Error
          ? error.message
          : 'Unable to load clients.'
      );
    } finally {
      setDangerLoading(
        false
      );
    }
  }

  useEffect(() => {
    if (!dangerUnlocked) {
      return;
    }

    const timer =
      setTimeout(() => {
        loadDangerClients();
      }, 250);

    return () =>
      clearTimeout(timer);
  }, [
    dangerSearch,
    dangerUnlocked,
  ]);

  /*
   * =========================================================
   * START BLOCK / UNBLOCK
   * =========================================================
   */

  async function startDangerAction(
    client: DangerClient,
    action: DangerAction
  ) {
    setSelectedClient(
      client
    );

    setDangerAction(
      action
    );

    setDangerProcessing(
      true
    );

    setDangerError('');

    try {
      const response =
        await fetch(
          `/api/admin/danger-zone/clients/${client.id}`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              action,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error?.message ||
            'Unable to start confirmation.'
        );
      }

      setChallenge(
        data.data?.challenge ||
          ''
      );

      setSeconds(
        data.data?.waitSeconds ??
          5
      );
    } catch (error) {
      setSelectedClient(
        null
      );

      setDangerAction(
        null
      );

      setChallenge('');

      setSeconds(0);

      setDangerError(
        error instanceof Error
          ? error.message
          : 'Unable to start action.'
      );
    } finally {
      setDangerProcessing(
        false
      );
    }
  }

  /*
   * =========================================================
   * COUNTDOWN
   * =========================================================
   */

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer =
      setInterval(() => {
        setSeconds(
          (current) =>
            current > 0
              ? current - 1
              : 0
        );
      }, 1000);

    return () =>
      clearInterval(
        timer
      );
  }, [seconds]);

  /*
   * =========================================================
   * CONFIRM BLOCK / UNBLOCK
   * =========================================================
   */

  async function confirmDangerAction() {
    if (
      !selectedClient ||
      !dangerAction ||
      !challenge ||
      seconds > 0
    ) {
      return;
    }

    setDangerProcessing(
      true
    );

    setDangerError('');

    try {
      const response =
        await fetch(
          `/api/admin/danger-zone/clients/${selectedClient.id}`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              action:
                dangerAction,

              confirmToken:
                challenge,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error?.message ||
            'Action failed.'
        );
      }

      setSelectedClient(
        null
      );

      setDangerAction(
        null
      );

      setChallenge('');

      setSeconds(0);

      /*
       * Refresh Danger Zone list.
       */

      await loadDangerClients();

      /*
       * Refresh normal client list too.
       */

      await loadClients();
    } catch (error) {
      setDangerError(
        error instanceof Error
          ? error.message
          : 'Action failed.'
      );
    } finally {
      setDangerProcessing(
        false
      );
    }
  }

  /*
   * =========================================================
   * CANCEL BLOCK / UNBLOCK
   * =========================================================
   */

  function cancelDangerAction() {
    if (dangerProcessing) {
      return;
    }

    setSelectedClient(
      null
    );

    setDangerAction(
      null
    );

    setChallenge('');

    setSeconds(0);
  }

  /*
   * =========================================================
   * PAGE UI
   * =========================================================
   */

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Clients
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage client accounts and view client details.
          </p>

        </div>

        <div className="flex flex-col gap-2 sm:flex-row">

          {/* DANGER ZONE */}

          <button
            type="button"
            onClick={
              openDangerZone
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/50 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition hover:border-danger hover:bg-danger/20"
          >

            <ShieldAlert className="h-4 w-4" />

            Danger Zone

          </button>

          {/* CREATE CLIENT */}

          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >

            <Plus className="h-4 w-4" />

            Create Client

          </Link>

        </div>

      </div>

      {/* =====================================================
          NORMAL SEARCH
      ===================================================== */}

      <div className="glass rounded-xl p-4">

        <div className="relative">

          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

          <input
            type="search"
            name="client-search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by name, email, or phone..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-lpignore="true"
            data-1p-ignore="true"
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />

        </div>

      </div>

      {/* =====================================================
          CLIENT TABLE
      ===================================================== */}

      <div className="glass overflow-hidden rounded-xl">

        {loading ? (

          <div className="p-6 text-sm text-text-secondary">
            Loading...
          </div>

        ) : clients.length === 0 ? (

          <div className="p-6 text-sm text-text-secondary">
            No clients found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[760px] text-left text-sm">

              <thead className="border-b border-border text-text-muted">

                <tr>

                  <th className="px-4 py-3 font-medium">
                    Client
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Contact
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Company
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-border">

                {clients.map(
                  (client) => (

                    <tr
                      key={
                        client.id
                      }
                      className="hover:bg-surface/40"
                    >

                      <td className="px-4 py-4">

                        <div className="font-medium text-text-primary">
                          {client.name}
                        </div>

                        <div className="text-xs text-text-muted">
                          {client.email}
                        </div>

                      </td>

                      <td className="px-4 py-4 text-text-secondary">

                        <div className="flex items-center gap-2">

                          <Mail className="h-4 w-4 text-text-muted" />

                          {client.email}

                        </div>

                        <div className="mt-1 flex items-center gap-2">

                          <Phone className="h-4 w-4 text-text-muted" />

                          {client.phone ??
                            '—'}

                        </div>

                      </td>

                      <td className="px-4 py-4 text-text-secondary">
                        {client.companyName ??
                          '—'}
                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            client.status ===
                            'DEACTIVATED'
                              ? 'bg-danger/10 text-danger'
                              : 'bg-success/10 text-success'
                          }`}
                        >
                          {client.status}
                        </span>

                      </td>

                      <td className="px-4 py-4">

                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-surface"
                        >

                          <Eye className="h-4 w-4" />

                          View

                        </Link>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          DANGER ZONE MODAL
      ===================================================== */}

      {dangerOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-danger/30 bg-background-secondary shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-border p-6">

              <div className="flex items-start gap-4">

                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-danger/40 bg-danger/10 text-danger">

                  <AlertTriangle className="h-6 w-6" />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-danger">
                    Danger Zone
                  </h2>

                  <p className="mt-1 text-sm text-text-secondary">
                    Restricted administrative area
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeDangerZone
                }
                disabled={
                  dangerProcessing
                }
                className="rounded-lg p-2 text-text-muted transition hover:bg-surface hover:text-text-primary disabled:opacity-50"
              >

                <X className="h-5 w-5" />

              </button>

            </div>

            {/* =================================================
                PASSWORD SCREEN
            ================================================= */}

            {!dangerUnlocked && (

              <div className="p-6">

                <div className="rounded-xl border border-danger/30 bg-danger/5 p-5">

                  <div className="flex items-start gap-3">

                    <Lock className="mt-0.5 h-5 w-5 shrink-0 text-danger" />

                    <div>

                      <p className="font-semibold text-danger">
                        Restricted Area
                      </p>

                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        Only the Super Admin can access client block and unblock controls.
                      </p>

                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        Blocking a client does not delete any account, client, project, message, payment, or other stored data.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="mt-6">

                  <label className="mb-2 block text-sm font-medium">
                    Danger Zone Password
                  </label>

                  <input
                    type="password"
                    name="danger-zone-password"
                    value={
                      dangerPassword
                    }
                    onChange={(e) =>
                      setDangerPassword(
                        e.target.value
                      )
                    }
                    autoFocus
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    placeholder="Enter private password"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm outline-none transition focus:border-red-400"
                  />

                  {dangerError && (

                    <p className="mt-3 text-sm text-danger">
                      {dangerError}
                    </p>

                  )}

                  <button
                    type="button"
                    onClick={
                      unlockDangerZone
                    }
                    disabled={
                      dangerUnlocking
                    }
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <Unlock className="h-4 w-4" />

                    {dangerUnlocking
                      ? 'Unlocking...'
                      : 'Unlock Danger Zone'}

                  </button>

                </div>

              </div>

            )}

            {/* =================================================
                UNLOCKED SCREEN
            ================================================= */}

            {dangerUnlocked && (

              <div className="p-6">

                <div className="rounded-xl border border-danger/30 bg-danger/5 p-5">

                  <div className="flex items-start gap-3">

                    <Unlock className="mt-0.5 h-5 w-5 shrink-0 text-danger" />

                    <div>

                      <p className="font-semibold text-danger">
                        Danger Zone Unlocked
                      </p>

                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        Search for a client by name, email address, or phone number.
                      </p>

                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        Blocking only deactivates the account. All stored client data remains preserved.
                      </p>

                    </div>

                  </div>

                </div>

                {/* SEARCH */}

                <div className="mt-6">

                  <label className="mb-2 block text-sm font-medium">
                    Search Client
                  </label>

                  <div className="relative">

                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

                    <input
                      type="search"
                      name="danger-client-search"
                      value={
                        dangerSearch
                      }
                      onChange={(
                        event
                      ) =>
                        setDangerSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Search by name, email, or phone number..."
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      data-lpignore="true"
                      data-1p-ignore="true"
                      className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
                    />

                  </div>

                  <p className="mt-2 text-xs text-text-muted">
                    Enter any one of the client's name, email address, or phone number.
                  </p>

                </div>

                {/* ERROR */}

                {dangerError && (

                  <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                    {dangerError}
                  </div>

                )}

                {/* LOADING */}

                {dangerLoading && (

                  <div className="mt-4 rounded-xl border border-border bg-surface p-5 text-sm text-text-secondary">
                    Searching clients...
                  </div>

                )}

                {/* NO RESULTS */}

                {!dangerLoading &&
                  dangerClients.length ===
                    0 && (

                    <div className="mt-4 rounded-xl border border-border bg-surface p-8 text-center">

                      <p className="font-semibold">
                        No client found
                      </p>

                      <p className="mt-1 text-sm text-text-secondary">
                        Try another name, email address, or phone number.
                      </p>

                    </div>

                  )}

                {/* RESULTS */}

                <div className="mt-4 space-y-3">

                  {dangerClients.map(
                    (client) => {

                      const blocked =
                        client.status ===
                        'DEACTIVATED';

                      return (

                        <div
                          key={
                            client.id
                          }
                          className={`rounded-xl border bg-surface p-5 ${
                            blocked
                              ? 'border-danger/30'
                              : 'border-border'
                          }`}
                        >

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="font-semibold text-text-primary">
                                  {client.name}
                                </h3>

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
                                {client.phone ??
                                  'No phone number'}
                              </p>

                              {client
                                .client
                                ?.companyName && (

                                <p className="mt-1 text-xs text-text-muted">
                                  {
                                    client
                                      .client
                                      .companyName
                                  }
                                </p>

                              )}

                            </div>

                            {/* DYNAMIC BUTTON */}

                            <button
                              type="button"
                              disabled={
                                dangerProcessing
                              }
                              onClick={() =>
                                startDangerAction(
                                  client,
                                  blocked
                                    ? 'UNBLOCK'
                                    : 'BLOCK'
                                )
                              }
                              className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
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
                    }
                  )}

                </div>

                {/* CLOSE */}

                <div className="mt-6 flex justify-end border-t border-border pt-5">

                  <button
                    type="button"
                    onClick={
                      closeDangerZone
                    }
                    disabled={
                      dangerProcessing
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-surface disabled:opacity-50"
                  >

                    <Lock className="h-4 w-4" />

                    Close Danger Zone

                  </button>

                </div>

              </div>

            )}

            {/* =================================================
                BLOCK / UNBLOCK CONFIRMATION
            ================================================= */}

            {selectedClient &&
              dangerAction && (

                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">

                  <div className="w-full max-w-md rounded-2xl border border-border bg-background-secondary p-6 shadow-2xl">

                    <div className="flex items-start justify-between">

                      <div>

                        <h3
                          className={`text-xl font-bold ${
                            dangerAction ===
                            'BLOCK'
                              ? 'text-danger'
                              : 'text-success'
                          }`}
                        >
                          {dangerAction ===
                          'BLOCK'
                            ? 'Block Client?'
                            : 'Unblock Client?'}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-text-secondary">

                          Are you sure you want to{' '}

                          {dangerAction ===
                          'BLOCK'
                            ? 'block'
                            : 'unblock'}{' '}

                          <span className="font-semibold text-text-primary">
                            {
                              selectedClient.name
                            }
                          </span>

                          ?

                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          cancelDangerAction
                        }
                        disabled={
                          dangerProcessing
                        }
                        className="rounded-lg p-2 text-text-muted hover:bg-surface"
                      >

                        <X className="h-5 w-5" />

                      </button>

                    </div>

                    {/* BLOCK INFO */}

                    {dangerAction ===
                      'BLOCK' && (

                      <div className="mt-5 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm leading-6 text-text-secondary">

                        <strong className="text-text-primary">
                          The account will be deactivated.
                        </strong>{' '}

                        No client data will be deleted.
                        Profile, projects, messages,
                        payments, notifications and
                        other stored information will
                        remain preserved.

                      </div>

                    )}

                    {/* UNBLOCK INFO */}

                    {dangerAction ===
                      'UNBLOCK' && (

                      <div className="mt-5 rounded-xl border border-success/20 bg-success/5 p-4 text-sm leading-6 text-text-secondary">

                        <strong className="text-text-primary">
                          The account will be restored.
                        </strong>{' '}

                        All existing client data will
                        remain unchanged.

                      </div>

                    )}

                    {/* TIMER */}

                    <div className="mt-5 rounded-xl border border-border bg-surface p-5 text-center">

                      {seconds > 0 ? (

                        <>

                          <p className="text-sm text-text-secondary">
                            Please wait before final confirmation.
                          </p>

                          <p className="mt-2 text-4xl font-bold">
                            {seconds}
                          </p>

                        </>

                      ) : (

                        <p className="text-sm font-medium text-success">
                          Confirmation is ready.
                        </p>

                      )}

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="mt-6 flex gap-3">

                      <button
                        type="button"
                        onClick={
                          cancelDangerAction
                        }
                        disabled={
                          dangerProcessing
                        }
                        className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          confirmDangerAction
                        }
                        disabled={
                          dangerProcessing ||
                          seconds > 0
                        }
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          dangerAction ===
                          'BLOCK'
                            ? 'bg-danger'
                            : 'bg-success'
                        }`}
                      >
                        {dangerProcessing
                          ? 'Processing...'
                          : dangerAction ===
                              'BLOCK'
                            ? 'Confirm Block'
                            : 'Confirm Unblock'}
                      </button>

                    </div>

                  </div>

                </div>

              )}

          </div>

        </div>

      )}

    </div>
  );
}