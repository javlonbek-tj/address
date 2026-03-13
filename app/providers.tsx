'use client';

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            toast.error(error.message ?? 'Xatolik yuz berdi');
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
              style: {
                backgroundColor: 'oklch(0.6 0.23 25)',
                color: 'oklch(0.985 0 0)',
              },
            },
          }}
        />
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
