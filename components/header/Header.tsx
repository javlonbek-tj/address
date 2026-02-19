'use client';

import { usePathname } from 'next/navigation';
import { HeaderActions } from './HeaderActions';
import { menuItems } from '@/lib';

export function Header() {
  const pathname = usePathname();
  const title =
    menuItems.find((item) => item.href === pathname)?.title ?? 'Ochiq Xarita';
  return (
    <header
      className={
        'flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-all duration-300'
      }
    >
      <h1 className='text-lg font-semibold'>{title}</h1>
      <HeaderActions />
    </header>
  );
}
