'use client';

import { usePathname } from 'next/navigation';
import { HeaderActions } from './HeaderActions';
import { menuItems } from '@/lib';
import { SidebarTrigger } from '../ui/sidebar';

export function Header() {
  const pathname = usePathname();
  const title =
    menuItems.find((item) => item.href === pathname)?.title ?? 'Ochiq Xarita';
  return (
    <header
      className={
        'sticky top-0 z-(--z-header) bg-background flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-all duration-300'
      }
    >
      <div className='flex items-center gap-2'>
        <SidebarTrigger />
        <h1 className='font-semibold text-base tracking-tight'>{title}</h1>
      </div>
      <HeaderActions />
    </header>
  );
}
