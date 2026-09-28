'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    verificationRequired,
    setVerificationRequired,
  ] = useState(false);

  const [
    verificationIdentifier,
    setVerificationIdentifier,
  ] = useState('');

  const [
    showDeactivatedPopup,
    setShowDeactivatedPopup,
  ] = useState(false);

  const [
    deactivatedUser,
    setDeactivatedUser,
  ] = useState<{
    name: string;
    email: string;
    phone: string | null;
  } | null>(null);

  /*
   * =====================================================
   * OPEN DEACTIVATED POPUP
   * =====================================================
   */

  function openDeactivatedPopup(
    user: {
      name: string;
      email: string;
      phone: string | null;
    }
  ) {
    setDeactivatedUser(user);
    setShowDeactivatedPopup(true);
  }

  /*
   * =====================================================
   * CLOSE DEACTIVATED POPUP
   * =====================================================
   */

  function closeDeactivatedPopup() {
    if (loading) {
      return;
    }

    setShowDeactivatedPopup(false);
    setDeactivatedUser(null);
  }

  /*
   * =====================================================
   * WHATSAPP RECOVERY
   * =====================================================
   *
   * This only sends a recovery request.
   *
   * It does NOT automatically unblock the account.
   */

  function openWhatsAppRecovery() {
    if (!deactivatedUser) {
      return;
    }

    const message = [
      'Hello Vitota Technologies Team,',
      '',
      'I would like to request recovery of my deactivated account.',
      '',
      `Name: ${deactivatedUser.name}`,
      `Email: ${deactivatedUser.email}`,
      `Phone: ${
        deactivatedUser.phone ||
        'Not provided'
      }`,
      '',
      'My account has been deactivated because it was determined that company rules were violated.',
      '',
      'I believe that I have not violated any company rule and request the company team to review my account and consider recovery.',
      '',
      'I understand that this request does not automatically restore my account and that the final decision remains with Vitota Technologies.',
      '',
      'Thank you.',
    ].join('\n');

    const whatsappUrl =
      `https://wa.me/919893138826?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  /*
   * =====================================================
   * VERIFICATION PAGE
   * =====================================================
   */

  async function openVerificationPage() {
    if (!verificationIdentifier) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isEmail =
        verificationIdentifier.includes(
          '@'
        );

      const purpose =
        isEmail
          ? 'EMAIL_VERIFICATION'
          : 'PHONE_VERIFICATION';

      const res =
        await fetch(
          '/api/auth/otp/send',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              identifier:
                verificationIdentifier,
              purpose,
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
            'Unable to send verification code.'
        );
      }

      if (isEmail) {
        router.push(
          `/verify?email=${encodeURIComponent(
            verificationIdentifier
          )}`
        );
      } else {
        router.push(
          `/verify?phone=${encodeURIComponent(
            verificationIdentifier
          )}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send verification code.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =====================================================
   * LOGIN SUBMIT
   * =====================================================
   */

  async function onSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationRequired(false);

    const form =
      e.currentTarget;

    const fd =
      new FormData(form);

    const identifier =
      String(
        fd.get(
          'identifier'
        ) || ''
      ).trim();

    const password =
      String(
        fd.get(
          'password'
        ) || ''
      );

    try {
      const res =
        await fetch(
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
              loginType:
                'CLIENT',
            }),
          }
        );

      const json =
        await res.json();

      /*
       * =================================================
       * DEACTIVATED ACCOUNT
       * =================================================
       */

      if (
        res.ok &&
        json.success &&
        json.data
          ?.accountDeactivated
      ) {
        openDeactivatedPopup({
          name:
            json.data.user
              ?.name ||
            'Account Holder',

          email:
            json.data.user
              ?.email ||
            identifier,

          phone:
            json.data.user
              ?.phone ||
            null,
        });

        return;
      }

      /*
       * =================================================
       * VERIFICATION REQUIRED
       * =================================================
       */

      if (
        !res.ok &&
        json.error?.code ===
          'VERIFICATION_REQUIRED'
      ) {
        setVerificationIdentifier(
          identifier
        );

        setVerificationRequired(
          true
        );

        return;
      }

      /*
       * =================================================
       * OTHER LOGIN ERROR
       * =================================================
       */

      if (
        !res.ok ||
        !json.success
      ) {
        throw new Error(
          json.error?.message ||
            'Login failed.'
        );
      }

      /*
       * =================================================
       * CLIENT LOGIN MUST GO ONLY TO CLIENT PANEL
       * =================================================
       */

      if (
        json.data?.role !==
        'CLIENT'
      ) {
        throw new Error(
          'Administrator accounts must use the Admin Login page.'
        );
      }

      router.push(
        '/client'
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* =====================================================
          LOGIN CARD
      ===================================================== */}

      <div className="glass w-full max-w-md rounded-2xl p-8">

        <div className="mb-6 text-center">

          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground">
            V
          </div>

          <h1 className="text-2xl font-bold">
            Welcome back
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Sign in to your Vitota Technologies account
          </p>

        </div>

        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form
          onSubmit={onSubmit}
          className="space-y-4"
        >

          <Input
            name="identifier"
            label="Email or Phone"
            required
            placeholder="you@example.com"
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

          {/* ===============================================
              VERIFICATION REQUIRED
          =============================================== */}

          {verificationRequired && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">

              <div className="flex items-center justify-between gap-4">

                <div className="min-w-0">

                  <p className="text-sm font-medium text-primary">
                    Verification required
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    Please verify your email or phone number before signing in.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    openVerificationPage
                  }
                  disabled={loading}
                  className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Verify Now
                </button>

              </div>

            </div>
          )}

          {/* ===============================================
              ERROR
          =============================================== */}

          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">

              <p className="text-sm text-danger">
                {error}
              </p>

            </div>
          )}

          {/* ===============================================
              SIGN IN
          =============================================== */}

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {loading
              ? 'Signing In...'
              : 'Sign In'}
          </Button>

        </form>

        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        <div className="mt-6 text-center text-sm text-text-secondary">

          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot password?
          </Link>

        </div>

        {/* =================================================
            REGISTER
        ================================================= */}

        <div className="mt-2 text-center text-sm text-text-secondary">

          Don&apos;t have an account?{' '}

          <Link
            href="/register"
            className="text-primary hover:underline"
          >
            Create one
          </Link>

        </div>

      </div>

      {/* =====================================================
          DEACTIVATED ACCOUNT POPUP
      ===================================================== */}

      {showDeactivatedPopup && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >

          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background-secondary shadow-2xl">

            {/* =============================================
                HEADER
            ============================================= */}

            <div className="border-b border-border px-6 py-5">

              <div className="text-center">

                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger">

                  <span className="text-xl font-bold">
                    !
                  </span>

                </div>

                <h2 className="mt-4 text-xl font-bold text-text-primary">
                  Account Deactivated
                </h2>

              </div>

            </div>

            {/* =============================================
                MESSAGE
            ============================================= */}

            <div className="px-6 py-6">

              <div className="rounded-xl border border-border bg-surface/40 p-5">

                <p className="text-center text-sm leading-7 text-text-secondary">

                  Your account has been deactivated
                  because you violated our company
                  rules.

                </p>

                <p className="mt-4 text-center text-sm leading-7 text-text-secondary">

                  If you believe that you have not
                  violated any company rule, you can
                  submit a recovery request to our
                  team.

                </p>

                <p className="mt-4 text-center text-xs leading-6 text-text-muted">

                  Your account data remains securely
                  stored. A recovery request does not
                  automatically restore the account.
                  The final decision is made by
                  Vitota Technologies.

                </p>

              </div>

            </div>

            {/* =============================================
                TWO BUTTONS ONLY
            ============================================= */}

            <div className="flex flex-col gap-3 border-t border-border px-6 py-5 sm:flex-row">

              {/* REQUEST RECOVERY */}

              <button
                type="button"
                onClick={
                  openWhatsAppRecovery
                }
                disabled={
                  loading ||
                  !deactivatedUser
                }
                className="flex-1 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm font-semibold text-success transition hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Request Recovery
              </button>

              {/* BACK TO WEBSITE */}

              <button
                type="button"
                onClick={() =>
                  router.push('/')
                }
                disabled={loading}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-secondary transition hover:bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back to Website
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}