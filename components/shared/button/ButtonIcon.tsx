import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib';

interface ButtonIconProps extends React.ComponentPropsWithoutRef<
  typeof Button
> {
  icon: React.ReactNode;
  label: string;
}

export function ButtonIcon({
  icon,
  label,
  className,
  ...props
}: ButtonIconProps) {
  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label={label}
      className={cn('cursor-pointer', className)}
      {...props}
    >
      {icon}
      <span className='sr-only'>{label}</span>
    </Button>
  );
}
