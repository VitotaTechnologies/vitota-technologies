'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function onSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    const form =
      e.currentTarget;

    const fd =
      new FormData(form);

    const identifier =
      String(
        fd.get('identifier') || ''
      ).trim();

    const password =
      String(
        fd.get('password') || ''
      );

    try {
      const res = await fetch(
        '/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            identifier,
            password,
            loginType: 'ADMIN',
          }),
        }
      );

      const json =
        await res.json();

      if (
        !res.ok ||
        !json.success
      ) {
        throw new Error(
          json.error?.message ||
            'Admin login failed.'
        );
      }

      /*
       * Only admin-side roles can reach here.
       */
      if (
        json.data?.role !==
          'SUPER_ADMIN' &&
        json.data?.role !== 'ADMIN' &&
        json.data?.role !== 'STAFF'
      ) {
        throw new Error(
          'This account is not authorized for Admin Login.'
        );
      }

      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Admin login failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass w-full max-w-md rounded-2xl p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground">
          V
        </div>

        <h1 className="text-2xl font-bold">
          Admin Login
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Authorized personnel only
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <Input
          name="identifier"
          label="Admin Email or Phone"
          required
          placeholder="admin@example.com"
          autoComplete="username"
          disabled={loading}
        />

        <Input
          name="password"
          type="password"
          label="Password"
          required
          autoComplete="current-password"
          disabled={loading}
        />

        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
            <p className="text-sm text-danger">
              {error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          {loading
            ? 'Signing In...'
            : 'Admin Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        <Link
          href="/login"
          className="text-primary hover:underline"
        >
          Back to Client Login
        </Link>
      </div>
    </div>
  );
}