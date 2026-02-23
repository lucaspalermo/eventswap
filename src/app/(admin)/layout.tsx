import { AdminSidebar } from '@/components/admin/admin-sidebar';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Admin Sidebar - fixed 260px */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
