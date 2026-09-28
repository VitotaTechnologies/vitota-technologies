import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';


export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect('/login');
  if (user.status !== 'ACTIVE') redirect('/login');
  if (!['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(user.role)) {
    redirect('/client');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar
        user={{
          name: user.name,
          role: user.role,
        }}
      />

      <div className="flex-1 lg:pl-64">
        <AdminTopbar
          user={{
            name: user.name,
            role: user.role,
          }}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global incoming call popup */}
      
    </div>
  );
}