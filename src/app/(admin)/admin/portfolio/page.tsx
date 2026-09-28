'use client';

import { CmsList } from '@/components/admin/CmsList';

export default function AdminPortfolioPage() {
  return (
    <CmsList
      title="Portfolio"
      endpoint="/api/admin/portfolio"
      displayPrimary={(p) => p.title}
      displaySecondary={(p) => p.category ?? ''}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'shortDesc', label: 'Short Description', type: 'textarea', required: true },
        { name: 'fullDesc', label: 'Full Description', type: 'textarea' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'imageUrl', label: 'Image URL', type: 'url' },
        { name: 'projectUrl', label: 'Project URL', type: 'url' },
      ]}
    />
  );
}