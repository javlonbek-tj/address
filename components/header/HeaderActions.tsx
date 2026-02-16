'use client';

import { Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ButtonIcon } from '../shared';

export function HeaderActions() {
  const { setTheme, theme } = useTheme();

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
          <TooltipContent className='bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 **:data-[slot=tooltip-arrow]:hidden'>
            Mavzuni o&apos;zgartirish
          </TooltipContent>
        </Tooltip>

        {/* User profile */}
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonIcon
              variant='ghost'
              size='icon'
              label='User profile'
              icon={<User className='h-[1.2rem] w-[1.2rem]' />}
            />
          </TooltipTrigger>
          <TooltipContent className='bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 **:data-[slot=tooltip-arrow]:hidden'>
            Profil
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
