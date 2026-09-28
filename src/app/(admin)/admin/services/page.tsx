'use client';

import { CmsList } from '@/components/admin/CmsList';

export default function AdminServicesPage() {
  return (
    <CmsList
      title="Services"
      endpoint="/api/admin/services"
      displayPrimary={(s) => s.title}
      displaySecondary={(s) => s.category ?? ''}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'shortDesc', label: 'Short Description', type: 'textarea', required: true },
        { name: 'fullDesc', label: 'Full Description', type: 'textarea' },
        { name: 'icon', label: 'Icon', type: 'text' },
        { name: 'category', label: 'Category', type: 'text' },
      ]}
    />
  );
}