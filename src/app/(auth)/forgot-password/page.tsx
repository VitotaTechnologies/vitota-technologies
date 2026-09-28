'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setMsg(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message);
      setStep('reset');
      setMsg('If an account exists, a code has been sent.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setMsg(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, newPassword, confirmPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message);
      router.push('/login');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="glass w-full max-w-md rounded-2xl p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
      </div>

      {step === 'request' ? (
        <form onSubmit={requestOtp} className="space-y-4">
          <Input label="Email or Phone" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          {error && <p className="text-sm text-danger">{error}</p>}
          {msg && <p className="text-sm text-success">{msg}</p>}
          <Button type="submit" loading={loading} className="w-full">Send Reset Code</Button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="space-y-4">
          <Input label="Verification Code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
          <Input type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          {error && <p className="text-sm text-danger">{error}</p>}
          {msg && <p className="text-sm text-success">{msg}</p>}
          <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
        </form>
      )}
    </div>
  );
}