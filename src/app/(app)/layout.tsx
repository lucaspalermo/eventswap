import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppTopbar } from '@/components/layout/app-topbar';

export const dynamic = 'force-dynamic';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar - desktop only (lg+) */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="lg:pl-[280px] flex flex-col min-h-screen">
        {/* Top bar */}
        <AppTopbar />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
