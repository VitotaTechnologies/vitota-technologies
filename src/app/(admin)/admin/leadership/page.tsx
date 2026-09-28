'use client';


import { CmsList } from '@/components/admin/CmsList';

export default function AdminLeadershipPage() {
  return (
    <CmsList
      title="Leadership"
      endpoint="/api/admin/leadership"
      displayPrimary={(l) => l.name}
      displaySecondary={(l) => l.position}
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'bio', label: 'Biography', type: 'textarea' },
        { name: 'photoUrl', label: 'Photo URL', type: 'url' },
      ]}
    />
  );
}