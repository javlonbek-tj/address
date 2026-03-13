import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Map, Settings2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailMapWrapper } from '@/components/map/DetailMapWrapper';
import { Spinner } from '@/components/shared';
import { getStreetById } from '@/server/data/streets';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import type { Geometry } from 'geojson';

export default async function StreetDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  return (
    <Suspense fallback={<Spinner />}>
      <StreetDetailContent id={id} />
    </Suspense>
  );
}

async function StreetDetailContent({ id }: { id: string }) {
  const street = await getStreetById(id);

  if (!street) {
    notFound();
  }

  return (
    <div className='p-6 h-full flex flex-col space-y-6'>
      <div className='flex items-center gap-4'>
        <Link href='/streets'>
          <Button variant='outline' size='icon'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
        </Link>
        <h1 className='text-lg font-bold'>{street.name}</h1>
        <Badge
          variant='secondary'
          className='bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800/50'
        >
          {street.type}
        </Badge>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='space-y-6'>
          <Card className='bg-white dark:bg-gray-900 dark:border-white/20 h-fit'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Settings2 className='w-4 h-4' />
                Asosiy ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Viloyat:
                </span>
                <span className='col-span-2'>
                  {street.district.region.name}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Tuman:
                </span>
                <span className='col-span-2'>{street.district.name}</span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Nomi:
                </span>
                <span className='col-span-2 font-medium'>{street.name}</span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Turi:
                </span>
                <span className='col-span-2 font-medium'>{street.type}</span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Kodi:
                </span>
                <span className='col-span-2 font-mono text-xs'>
                  {street.code}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Uzkad kodi:
                </span>
                <span className='col-span-2 font-mono text-xs'>
                  {street.uzKadCode || (
                    <span className='italic text-muted-foreground font-sans'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white dark:bg-gray-900 dark:border-white/20 h-fit'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Info className='w-4 h-4' />
                Qo'shimcha ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Tarixiy nomi:
                </span>
                <span className='col-span-2'>
                  {street.oldName || (
                    <span className='text-muted-foreground italic'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
              <div className='grid grid-cols-1 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground'>
                  Bog'langan mahallalar:
                </span>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {street.mahalla.map((m) => (
                    <Badge
                      key={m.id}
                      variant='secondary'
                      className='bg-slate-100 dark:bg-slate-800'
                    >
                      {m.name}
                    </Badge>
                  ))}
                  {street.mahalla.length === 0 && (
                    <span className='text-muted-foreground italic text-sm'>
                      Bog'langan mahallalar mavjud emas
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='bg-white dark:bg-gray-900 dark:border-white/20 flex flex-col h-125 lg:h-full min-h-lg overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Map className='w-5 h-5' />
              Geometriya va Joylashuv
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-1 p-0 relative'>
            <DetailMapWrapper
              geometry={street.geometry as unknown as Geometry}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
