'use client';

import { ChevronDown, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { menuItems } from '@/lib';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  Layers,
  MapPin,
  Building2,
  Home,
  Route,
  ChevronRight,
} from 'lucide-react';

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
    <Sidebar collapsible="icon" className="">
      <SidebarHeader className="flex items-center px-6 group-data-[state=collapsed]:px-2 border-b h-16 transition-all duration-300">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Map className="w-6 h-6 text-primary" />
          </div>
          <span className="group-data-[state=collapsed]:hidden font-bold text-lg tracking-tight transition-all duration-300">
            Manzillar tizimi
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-0">
            {menuItems
              .filter((item) => item.title !== 'Manzil tuzilmasi')
              .map((item) => (
                <SidebarMenuItem
                  key={item.href}
                  className="border-sidebar-border/50 border-b last:border-b-0"
                >
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="data-[active=true]:bg-blue-500/10 hover:bg-sidebar-accent/50 dark:data-[active=true]:bg-sidebar-accent px-5 group-data-[state=collapsed]:px-3 rounded-none h-12 data-[active=true]:text-blue-600 transition-all duration-300 dark:data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <Link href={item.href} className="gap-3">
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden font-medium text-base transition-all duration-300">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem className="border-sidebar-border/50 border-b last:border-b-0">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Manzil tuzilmasi"
                    className="data-[active=true]:bg-blue-500/10 hover:bg-sidebar-accent/50 dark:data-[active=true]:bg-sidebar-accent [&>svg:last-child]:ml-auto px-5 group-data-[state=collapsed]:px-3 rounded-none h-12 transition-all duration-300"
                  >
                    <MapPin className="w-5 h-5 shrink-0" />
                    <span className="group-data-[state=collapsed]:hidden font-medium text-base transition-all duration-300">
                      Manzil tuzilmasi
                    </span>
                    <ChevronDown className="w-4 h-4 group-data-[state=open]/collapsible:rotate-180 transition-transform duration-200" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="gap-0">
                    {[
                      { title: 'Hududlar', icon: MapPin, href: '/regions' },
                      {
                        title: 'Tumanlar',
                        icon: Building2,
                        href: '/districts',
                      },
                      { title: 'Mahallalar', icon: Home, href: '/mahallas' },
                      { title: "Ko'chalar", icon: Route, href: '/streets' },
                    ].map((subItem) => (
                      <SidebarMenuItem key={subItem.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === subItem.href}
                          tooltip={subItem.title}
                          className="data-[active=true]:bg-blue-500/5 hover:bg-sidebar-accent/50 px-8 group-data-[state=collapsed]:px-3 border-transparent data-[active=true]:border-blue-500 border-l-2 rounded-none h-10 transition-all duration-300"
                        >
                          <Link href={subItem.href} className="gap-3">
                            <subItem.icon className="w-4 h-4 shrink-0" />
                            <span className="group-data-[state=collapsed]:hidden text-sm">
                              {subItem.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter className='p-4 border-t'>
        <Button
          variant='outline'
          className='justify-start gap-3 w-full'
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
