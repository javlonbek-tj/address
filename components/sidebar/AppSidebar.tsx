'use client';

import { Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { menuItems } from '@/lib';

export function AppSidebar() {
  const pathname = usePathname();
  // const router = useRouter();
  // const [isLoggingOut, setIsLoggingOut] = useState(false);

  // const handleLogout = async () => {
  //   setIsLoggingOut(true);
  //   try {
  //     await fetch('/api/auth/logout', { method: 'POST' });
  //     router.push('/login');
  //     router.refresh();
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //   } finally {
  //     setIsLoggingOut(false);
  //   }
  // };

  return (
    <Sidebar collapsible='none' className=''>
      <SidebarHeader className='h-16 border-b flex items-center px-6'>
        <Link href='/' className='flex items-center gap-3'>
          <div className='bg-primary/10 p-2 rounded-lg'>
            <Map className='w-6 h-6 text-primary' />
          </div>
          <span className='font-bold text-lg tracking-tight'>
            Manzillar tizimi
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='gap-0'>
              {menuItems.map((item) => (
                <SidebarMenuItem
                  key={item.href}
                  className='border-b border-sidebar-border/50 last:border-b-0'
                >
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className='h-12 px-5 rounded-none hover:bg-sidebar-accent/50 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-600 dark:data-[active=true]:bg-sidebar-accent dark:data-[active=true]:text-sidebar-accent-foreground'
                  >
                    <Link href={item.href} className='gap-3'>
                      <item.icon className='w-5 h-5' />
                      <span className='font-medium text-base'>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter className='border-t p-4'>
        <Button
          variant='outline'
          className='w-full justify-start gap-3'
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className='w-5 h-5' />
          <span className='font-medium'>
            {isLoggingOut ? 'Chiqilmoqda...' : 'Chiqish'}
          </span>
        </Button>
      </SidebarFooter> */}
    </Sidebar>
  );
}
