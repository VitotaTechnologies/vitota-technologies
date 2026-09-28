'use client';

import { useEffect, useState } from 'react';
import {
  Lock,
  Mail,
  Phone,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type UserData = {
  name: string;
  email: string;
  phone: string | null;
};

export default function ClientSettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [passwordModal, setPasswordModal] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [passwordError, setPasswordError] =
    useState('');

  const [passwordMessage, setPasswordMessage] =
    useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(
        '/api/client/settings',
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Unable to load account settings.'
        );
      }

      const data = json.data;

      setUser(data);

      setName(data.name || '');
      setPhone(data.phone || '');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load account settings.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(
        '/api/client/settings',
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name,
            phone,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Unable to save changes.'
        );
      }

      setUser(json.data);

      setName(json.data.name || '');
      setPhone(json.data.phone || '');

      setMessage(
        'Your account information has been updated successfully.'
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save changes.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (passwordLoading) return;

    setPasswordError('');
    setPasswordMessage('');

    if (!currentPassword) {
      setPasswordError(
        'Please enter your current password.'
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        'Please enter a new password.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        'New password and Confirm Password do not match.'
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch(
        '/api/client/settings/password',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Unable to change password.'
        );
      }

      setPasswordMessage(
        'Password changed successfully.'
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setPasswordModal(false);
        setPasswordMessage('');
      }, 1200);
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : 'Unable to change password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  function closePasswordModal() {
    if (passwordLoading) return;

    setPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordMessage('');
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Settings
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Loading your account information...
          </p>
        </div>

        <div className="glass animate-pulse rounded-2xl p-6">
          <div className="h-5 w-48 rounded bg-surface" />
          <div className="mt-6 space-y-4">
            <div className="h-12 rounded-xl bg-surface" />
            <div className="h-12 rounded-xl bg-surface" />
            <div className="h-12 rounded-xl bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">
            Settings
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage your account information and security.
          </p>
        </div>

        {/* SUCCESS */}
        {message && (
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
            <p className="text-sm text-primary">
              {message}
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
            <p className="text-sm text-danger">
              {error}
            </p>
          </div>
        )}

        {/* ACCOUNT INFORMATION */}
        <section className="glass rounded-2xl p-6">

          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Update your personal account information.
            </p>
          </div>

          <form
            onSubmit={saveProfile}
            className="space-y-5"
          >

            {/* NAME */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />

                <input
                  id="name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                  disabled={saving}
                  autoComplete="name"
                  className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary disabled:opacity-60"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />

                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-surface/50 py-3 pl-11 pr-4 text-sm text-text-muted outline-none"
                />
              </div>

              <p className="mt-2 text-xs text-text-muted">
                Email address cannot be changed from Settings.
              </p>
            </div>

            {/* PHONE */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  disabled={saving}
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary disabled:opacity-60"
                />
              </div>

              <p className="mt-2 text-xs text-text-muted">
                Changing your phone number may require verification.
              </p>
            </div>

            {/* SAVE */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>

          </form>
        </section>

        {/* SECURITY */}
        <section className="glass rounded-2xl p-6">

          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Security
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Manage your account password.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Password
                </p>

                <p className="text-xs text-text-muted">
                  Keep your account secure with a strong password.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => {
                setPasswordModal(true);
                setPasswordError('');
                setPasswordMessage('');
              }}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              Change Password
            </button>

          </div>
        </section>

      </div>

      {/* PASSWORD MODAL */}
      {passwordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Update your account password securely.
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={passwordLoading}
                className="rounded-lg p-2 text-text-secondary hover:bg-surface hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {passwordMessage && (
              <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
                <p className="text-sm text-primary">
                  {passwordMessage}
                </p>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
                <p className="text-sm text-danger">
                  {passwordError}
                </p>
              </div>
            )}

            <form
              onSubmit={changePassword}
              className="space-y-4"
            >

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  required
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  disabled={passwordLoading}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  required
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  disabled={passwordLoading}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  disabled={passwordLoading}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* FORGOT PASSWORD */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      '/forgot-password'
                    )
                  }
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="flex gap-3 pt-3">

                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={passwordLoading}
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-surface disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                >
                  {passwordLoading
                    ? 'Updating...'
                    : 'Change Password'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}