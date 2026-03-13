'use client';

import { ChevronDown, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { menuItems, ROLE_HIERARCHY } from '@/lib';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { MapPin, Building2, Home, Route } from 'lucide-react';

export function AppSidebar({ userRole }: { userRole: string | null }) {
  const pathname = usePathname();
  const userLevel =
    ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0;
  const visibleItems = menuItems.filter((item) => {
    if (!item.minRole) return true;
    return (
      userLevel >=
      (ROLE_HIERARCHY[item.minRole as keyof typeof ROLE_HIERARCHY] ?? 0)
    );
  });

  return (
    <Sidebar collapsible='icon' className=''>
      <SidebarHeader className='flex justify-center items-center px-6 group-data-[state=collapsed]:px-2 border-b h-16'>
        <Link href='/' className='flex items-center gap-3'>
          <div className='bg-primary/10 p-2 rounded-lg'>
            <Map className='w-5 h-5 text-primary' />
          </div>
          <span className='group-data-[state=collapsed]:hidden font-bold text-base tracking-tight'>
            Manzillar tizimi
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className='gap-0'>
            {visibleItems
              .filter((item) => item.title !== 'Manzil tuzilmasi')
              .map((item) => (
                <SidebarMenuItem
                  key={item.href}
                  className='border-sidebar-border/50 border-b last:border-b-0'
                >
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className='data-[active=true]:bg-blue-500/10 px-5 group-data-[state=collapsed]:px-3 border-transparent data-[active=true]:border-blue-500 border-l-2 group-data-[state=collapsed]:border-l-0 rounded-none h-12'
                  >
                    <Link href={item.href} className='gap-3'>
                      <item.icon className='shrink-0' />
                      <span className='font-medium'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

            <Collapsible className='group/collapsible'>
              <SidebarMenuItem className='border-sidebar-border/50 border-b last:border-b-0'>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip='Manzil tuzilmasi'
                    className='data-[active=true]:bg-blue-500/10 [&>svg:last-child]:ml-auto px-5 group-data-[state=collapsed]:px-3 rounded-none h-12'
                  >
                    <MapPin className='shrink-0' />
                    <span className='group-data-[state=collapsed]:hidden font-medium'>
                      Manzil tuzilmasi
                    </span>
                    <ChevronDown className='group-data-[state=open]/collapsible:rotate-180' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className='gap-0'>
                    {[
                      {
                        title: 'Hududlar',
                        icon: MapPin,
                        href: '/regions',
                        minRole: 'admin',
                      },
                      {
                        title: 'Tumanlar',
                        icon: Building2,
                        href: '/districts',
                        minRole: 'region_user',
                      },
                      {
                        title: 'Mahallalar',
                        icon: Home,
                        href: '/mahallas',
                        minRole: null,
                      },
                      {
                        title: "Ko'chalar",
                        icon: Route,
                        href: '/streets',
                        minRole: null,
                      },
                      {
                        title: "Ko'chmas mulklar",
                        icon: Building2,
                        href: '/properties',
                        minRole: null,
                      },
                    ]
                      .filter((subItem) => {
                        if (!subItem.minRole) return true;
                        return (
                          userLevel >= (ROLE_HIERARCHY[subItem.minRole] ?? 0)
                        );
                      })
                      .map((subItem) => (
                        <SidebarMenuItem key={subItem.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === subItem.href}
                            tooltip={subItem.title}
                            size='sm'
                            className='data-[active=true]:bg-blue-500/10 px-8 group-data-[state=collapsed]:px-3 border-transparent data-[active=true]:border-blue-500 border-l-2 group-data-[state=collapsed]:border-l-0 rounded-none h-10'
                          >
                            <Link href={subItem.href} className='gap-3'>
                              <subItem.icon className='shrink-0' />
                              <span className='group-data-[state=collapsed]:hidden font-medium'>
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
    </Sidebar>
  );
}
