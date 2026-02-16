import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
