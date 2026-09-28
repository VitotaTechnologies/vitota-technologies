import { ReactNode } from 'react';

import { ClientNav } from '@/components/client/ClientNav';
import { requireClient } from '@/server/auth/authorization';

export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireClient();

  return (
    <div className="min-h-screen bg-background">

      {/* CLIENT SIDEBAR */}
      <ClientNav
        user={{
          name: user.name,
          email: user.email,
        }}
      />

      {/* MAIN CONTENT */}
      <main className="min-h-screen pl-[280px]">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-6 lg:px-8">
          {children}
        </div>
      </main>

    </div>
  );
}