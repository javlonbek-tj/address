import React from 'react';
import { AppSidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <SidebarProvider defaultOpen>
        <>
          <AppSidebar />
          <div className='flex flex-col flex-1 border-l'>
            <Header />
            <SidebarInset className='bg-blue-50 dark:bg-gray-900'>
              {children}
            </SidebarInset>
          </div>
        </>
      </SidebarProvider>
    </ThemeProvider>
  );
}
