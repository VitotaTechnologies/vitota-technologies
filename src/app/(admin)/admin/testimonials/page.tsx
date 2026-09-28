'use client';

import { CmsList } from '@/components/admin/CmsList';

export default function AdminTestimonialsPage() {
  return (
    <CmsList
      title="Testimonials"
      endpoint="/api/admin/testimonials"
      displayPrimary={(t) => t.displayName}
      displaySecondary={(t) => t.company ?? ''}
      fields={[
        { name: 'displayName', label: 'Display Name', type: 'text', required: true },
        { name: 'company', label: 'Company', type: 'text' },
        { name: 'role', label: 'Role', type: 'text' },
        { name: 'content', label: 'Testimonial', type: 'textarea', required: true },
        { name: 'photoUrl', label: 'Photo URL', type: 'url' },
      ]}
    />
  );
}