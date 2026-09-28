'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type VerificationMethod = 'email' | 'phone';

function VerifyInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const email = sp.get('email') ?? '';
  const phone = sp.get('phone') ?? '';

  const [method, setMethod] =
    useState<VerificationMethod>('email');

  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEmail = method === 'email';

  const identifier = isEmail ? email : phone;

  const purpose = isEmail
    ? 'EMAIL_VERIFICATION'
    : 'PHONE_VERIFICATION';

  async function sendOtp(
    nextMethod: VerificationMethod = method
  ) {
    const nextIdentifier =
      nextMethod === 'email' ? email : phone;

    const nextPurpose =
      nextMethod === 'email'
        ? 'EMAIL_VERIFICATION'
        : 'PHONE_VERIFICATION';

    if (!nextIdentifier) {
      throw new Error(
        nextMethod === 'email'
          ? 'Email address is not available.'
          : 'Phone number is not available.'
      );
    }

    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: nextIdentifier,
        purpose: nextPurpose,
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(
        json.error?.message ||
          'Unable to send verification code.'
      );
    }
  }

  async function switchMethod(
    nextMethod: VerificationMethod
  ) {
    if (nextMethod === method) return;

    setLoading(true);
    setError(null);
    setMsg(null);
    setOtp('');

    try {
      /*
       * Send a fresh OTP whenever the user switches
       * between Email and Phone verification.
       */
      await sendOtp(nextMethod);

      setMethod(nextMethod);

      setMsg(
        nextMethod === 'phone'
          ? 'A verification code has been sent to your phone number.'
          : 'A verification code has been sent to your email.'
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to switch verification method.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (!identifier) {
      setError(
        isEmail
          ? 'Email address is not available.'
          : 'Phone number is not available.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      await sendOtp();

      setOtp('');

      setMsg(
        isEmail
          ? 'A new verification code has been sent to your email.'
          : 'A new verification code has been sent to your phone number.'
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to send a new code.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!identifier) {
      setError(
        isEmail
          ? 'Email address is not available.'
          : 'Phone number is not available.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          otp,
          purpose,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Verification failed.'
        );
      }

      /*
       * OTP verification API already:
       *
       * 1. Marks Email/Phone as verified
       * 2. Changes account status to ACTIVE
       * 3. Creates the login session
       *
       * Now send the user to the correct dashboard.
       */
      if (json.data?.role === 'CLIENT') {
        router.replace('/client');
      } else {
        router.replace('/admin');
      }

      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Verification failed.'
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
          {isEmail
            ? 'Verify your account'
            : 'Verify your phone number'}
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Verify using either your email or phone number.
          Only one verification is required.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-text-secondary">
            OTP has been sent to:
          </p>

          <p className="mt-1 break-all text-sm font-medium text-text-primary">
            {identifier || 'Not available'}
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            aria-label="6-digit verification code"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value
                  .replace(/\D/g, '')
                  .slice(0, 6)
              )
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit OTP"
            maxLength={6}
            disabled={loading}
          />

          <Button
            onClick={verify}
            loading={loading}
            disabled={
              loading ||
              otp.length !== 6 ||
              !identifier
            }
          >
            Verify
          </Button>
        </div>

        <button
          type="button"
          onClick={resendOtp}
          disabled={loading || !identifier}
          className="text-sm text-text-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Resend code
        </button>

        {isEmail ? (
          <div className="border-t border-border pt-4">
            <p className="text-sm text-text-secondary">
              Didn&apos;t receive the email?
            </p>

            <button
              type="button"
              onClick={() =>
                switchMethod('phone')
              }
              disabled={
                loading || !phone
              }
              className="mt-2 text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue with Phone Number
            </button>
          </div>
        ) : (
          <div className="border-t border-border pt-4">
            <p className="text-sm text-text-secondary">
              Want to verify using email instead?
            </p>

            <button
              type="button"
              onClick={() =>
                switchMethod('email')
              }
              disabled={
                loading || !email
              }
              className="mt-2 text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              Use Email Instead
            </button>
          </div>
        )}

        {msg && (
          <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2">
            <p className="text-sm text-success">
              {msg}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
            <p className="text-sm text-danger">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}