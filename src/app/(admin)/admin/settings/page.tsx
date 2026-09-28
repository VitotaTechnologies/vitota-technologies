'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await (await fetch('/api/admin/settings')).json()).data,
  });

  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="glass space-y-4 rounded-xl p-6">
        <Input label="Company Name" value={form.companyName ?? ''} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        <Input label="Contact Email" value={form.contactEmail ?? ''} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        <Input label="Contact Phone" value={form.contactPhone ?? ''} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
        <Input label="Address" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <Textarea label="About Content" value={form.aboutContent ?? ''} onChange={(e) => setForm({ ...form, aboutContent: e.target.value })} rows={3} />
        <Textarea label="Mission" value={form.missionContent ?? ''} onChange={(e) => setForm({ ...form, missionContent: e.target.value })} rows={2} />
        <Textarea label="Vision" value={form.visionContent ?? ''} onChange={(e) => setForm({ ...form, visionContent: e.target.value })} rows={2} />
        <Button onClick={() => save.mutate()} loading={save.isPending}>Save Settings</Button>
      </div>
    </div>
  );
}