'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const services = [
  'Website Development', 'Web Application', 'E-commerce Development', 'UI/UX Design',
  'Business Website', 'Custom Software', 'Maintenance & Support', 'Digital Solutions',
  'Consulting', 'API Integration', 'Third-party Integration', 'Database Development',
  'AI-assisted Technology', 'Hosting / Domain Assistance', 'Other',
];

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urgent, setUrgent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      service: fd.get('service'),
      message: fd.get('message'),
      urgent,
    };
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || 'Failed to submit');
      setSuccess(true);
      e.currentTarget.reset();
      setUrgent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold text-success">Thank you!</h3>
        <p className="mt-2 text-sm text-text-secondary">Your inquiry has been received. We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-5 rounded-xl p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="name" label="Name" required placeholder="Your full name" />
        <Input name="email" type="email" label="Email" required placeholder="you@example.com" />
        <Input name="phone" label="Phone Number" required placeholder="+91 98765 43210" />
        <div className="w-full">
          <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-text-secondary">Service Required</label>
          <select id="service" name="service" defaultValue="" className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <option value="">Select a service</option>
            {services.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <Textarea name="message" label="Message" required rows={5} placeholder="Tell us about your project..." />

      <div className="flex items-center gap-3">
        <input
          id="urgent"
          type="checkbox"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-surface accent-primary"
        />
        <label htmlFor="urgent" className={`flex items-center gap-2 text-sm font-medium ${urgent ? 'text-success' : 'text-primary'}`}>
          <span aria-hidden>{urgent ? '✓' : '•'}</span>
          Mark as Urgent Request
        </label>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Send Inquiry
      </Button>
    </form>
  );
}