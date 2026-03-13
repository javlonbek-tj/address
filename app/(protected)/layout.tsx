import React from 'react';
import { getServerSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { assertActive } from '@/lib/auth/authorization';
import { AppSidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) redirect('/login');

  // This gates the entire (protected) subtree for inactive users
  assertActive(session.user, '/suspended');
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <SidebarProvider defaultOpen>
        <div className='flex h-screen min-h-0 w-full'>
          <AppSidebar userRole={session.user.role} />

          <div className='flex flex-col flex-1 min-w-0 min-h-0 border-l'>
            <Header />

            <SidebarInset className='flex-1 bg-blue-50 dark:bg-gray-900'>
              {children}
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
