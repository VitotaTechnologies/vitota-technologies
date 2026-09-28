'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '')
      .trim()
      .toLowerCase();
    const phone = String(fd.get('phone') || '').trim();
    const password = String(fd.get('password') || '');
    const confirmPassword = String(
      fd.get('confirmPassword') || ''
    );

    const acceptTerms =
      fd.get('acceptTerms') === 'on';

    // Terms validation
    if (!acceptTerms) {
      setError(
        'You must accept the Terms of Service.'
      );
      setLoading(false);
      return;
    }

    // Basic client-side validation
    if (!name) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    if (!phone) {
      setError('Please enter your phone number.');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Password and Confirm Password do not match.'
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        '/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
            confirmPassword,
            acceptTerms: true,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Registration failed. Please try again.'
        );
      }

      const registeredEmail = String(
        json.data?.email || email
      );

      const registeredPhone = String(
        json.data?.phone || phone
      );

      /*
       * Account is currently:
       *
       * PENDING_VERIFICATION
       *
       * The user must complete OTP verification.
       *
       * After successful OTP verification,
       * the API changes the account to ACTIVE.
       */
      router.push(
        `/verify?email=${encodeURIComponent(
          registeredEmail
        )}&phone=${encodeURIComponent(
          registeredPhone
        )}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
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
          Create your account
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Join Vitota Technologies
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <Input
          name="name"
          label="Full Name"
          required
          autoComplete="name"
          disabled={loading}
          placeholder="Enter your full name"
        />

        <Input
          name="email"
          type="email"
          label="Email"
          required
          autoComplete="email"
          disabled={loading}
          placeholder="you@example.com"
        />

        <Input
          name="phone"
          type="tel"
          label="Phone Number"
          required
          autoComplete="tel"
          disabled={loading}
          placeholder="+91 98765 43210"
        />

        <Input
          name="password"
          type="password"
          label="Password"
          required
          autoComplete="new-password"
          disabled={loading}
          placeholder="Create a secure password"
        />

        <Input
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          required
          autoComplete="new-password"
          disabled={loading}
          placeholder="Enter your password again"
        />

        <div className="flex items-start gap-3">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            required
            disabled={loading}
            className="mt-1 h-4 w-4 rounded border-border bg-surface accent-primary disabled:cursor-not-allowed disabled:opacity-60"
          />

          <label
            htmlFor="acceptTerms"
            className="text-sm text-text-secondary"
          >
            I have read and agree to the{' '}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Terms of Service
            </Link>
            .
          </label>
        </div>

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
            ? 'Creating Account...'
            : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}