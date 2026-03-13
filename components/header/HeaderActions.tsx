'use client';

import { Moon, Sun, KeyRound, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ButtonIcon } from '../shared';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession, signOut } from '@/lib/auth/auth-client';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import {
  getUserInitials,
  getUserDisplayName,
  getUserSubtitle,
} from '@/lib/utils';

export function HeaderActions() {
  const { setTheme, theme } = useTheme();
  const { data: session, isPending } = useSession();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const user = session?.user;

  const initials = getUserInitials(user?.fullName ?? null);
  const displayName = getUserDisplayName(user?.fullName ?? null);
  const subtitle = getUserSubtitle({
    role: user?.role ?? null,
    position: user?.position ?? null,
    regionName: user?.regionName ?? null,
    districtName: user?.districtName ?? null,
  });

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className='flex items-center gap-2'>
        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonIcon
              variant='ghost'
              size='icon'
              label='Toggle theme'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              icon={
                <>
                  <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
                  <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                </>
              }
            />
          </TooltipTrigger>
          <TooltipContent className='bg-gray-900 z-(--z-tooltip) dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 **:data-slot=tooltip-arrow:hidden'>
            Mavzuni o&apos;zgartirish
          </TooltipContent>
        </Tooltip>

        {/* User profile dropdown */}
        {isPending ? (
          <div className='flex items-center gap-2 px-2 py-1'>
            <Skeleton className='h-8 w-8 rounded-full shrink-0' />
            <div className='flex flex-col gap-1.5'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-2.5 w-32' />
            </div>
          </div>
        ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 hover:bg-accent transition-colors outline-none'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0'>
                {initials}
              </div>
              {displayName && (
                <div className='flex flex-col leading-tight text-left'>
                  <span className='text-sm font-medium'>{displayName}</span>
                  {subtitle && (
                    <span className='text-[11px] text-muted-foreground'>
                      {subtitle}
                    </span>
                  )}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-48 rounded-t-none'
            sideOffset={11}
            style={{ zIndex: 1050 }}
          >
            <DropdownMenuItem
              onClick={() => setChangePasswordOpen(true)}
              className='cursor-pointer'
            >
              <KeyRound className='mr-2 h-4 w-4' />
              Parolni o&apos;zgartirish
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className='text-destructive focus:text-destructive cursor-pointer'
            >
              <LogOut className='mr-2 h-4 w-4' />
              Chiqish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}
      </div>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </TooltipProvider>
  );
}
