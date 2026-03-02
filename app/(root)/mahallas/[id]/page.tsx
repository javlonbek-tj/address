import React, { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Map,
  CheckCircle2,
  History,
  FileText,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailMapWrapper } from '@/components/map/DetailMapWrapper';
import { Spinner } from '@/components/shared';
import { getMahallaById } from '@/server/data/mahallas';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default async function MahallaDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  return (
    <Suspense fallback={<Spinner />}>
      <MahallaDetailContent id={id} />
    </Suspense>
  );
}

async function MahallaDetailContent({ id }: { id: string }) {
  const mahalla = await getMahallaById(id);

  if (!mahalla) {
    notFound();
  }

  return (
    <div className='p-6 h-full flex flex-col space-y-6'>
      <div className='flex items-center gap-4'>
        <Link href='/mahallas'>
          <Button variant='outline' size='icon'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
        </Link>
        <div className='flex items-center gap-3'>
          <h1 className='text-lg font-bold'>{mahalla.name}</h1>
          {mahalla.isOptimized && (
            <Badge
              variant='outline'
              className='bg-emerald-50 text-emerald-600 border-emerald-200'
            >
              <CheckCircle2 className='w-3 h-3 mr-1' />
              Optimallashgan
            </Badge>
          )}
        </div>
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
                  {mahalla.district.region.name}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Tuman:
                </span>
                <span className='col-span-2'>{mahalla.district.name}</span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Uzkad nomi:
                </span>
                <span className='col-span-2 font-medium'>
                  {mahalla.uzKadName}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Geonames nomi:
                </span>
                <span className='col-span-2 font-medium'>{mahalla.name}</span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Uzkad kodi:
                </span>
                <span className='col-span-2'>{mahalla.code}</span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  APU kodi:
                </span>
                <span className='col-span-2'>{mahalla.geoCode}</span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  1c kodi:
                </span>
                <span className='col-span-2'>{mahalla.oneId}</span>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white dark:bg-gray-900 dark:border-white/20 h-fit'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <FileText className='w-4 h-4' />
                Qaror va Tarixiy ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Qaror:
                </span>
                <span className='col-span-2 text-sm'>
                  {mahalla.regulation || (
                    <span className='text-muted-foreground italic'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Tarixiy nomi:
                </span>
                <span className='col-span-2'>
                  {mahalla.oldName || (
                    <span className='text-muted-foreground italic'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Ko'chalar soni:
                </span>
                <span className='col-span-2 font-bold'>
                  {mahalla._count.streets}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Ko'chmas mulklar:
                </span>
                <span className='col-span-2 font-bold'>
                  {mahalla._count.properties}
                </span>
              </div>
            </CardContent>
          </Card>

          {mahalla.isOptimized && (
            <Card className='bg-white dark:bg-gray-900 dark:border-white/20 h-fit border-emerald-100 shadow-emerald-50/50'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2 text-emerald-600 dark:text-emerald-400'>
                  <History className='w-4 h-4' />
                  Optimallashuv tafsilotlari
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 text-sm'>
                {mahalla.mergedMahallas.length > 0 && (
                  <div>
                    <p className='font-medium mb-3 text-muted-foreground'>
                      Ushbu mahalla tarkibiga qo'shilgan mahallalar:
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {mahalla.mergedMahallas.map((m) => (
                        <Badge
                          key={m.id}
                          variant='secondary'
                          className='bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        >
                          {m.name} ({m.code})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {mahalla.mergedInto.length > 0 && (
                  <div>
                    <p className='font-medium mb-3 text-muted-foreground'>
                      Ushbu mahalla quyidagiga birlashtirilgan:
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {mahalla.mergedInto.map((m) => (
                        <Badge
                          key={m.id}
                          variant='secondary'
                          className='bg-slate-100 dark:bg-slate-800'
                        >
                          {m.name} ({m.code})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className='bg-white dark:bg-gray-900 dark:border-white/20 flex flex-col h-125 lg:h-full min-h-125 overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Map className='w-5 h-5' />
              Geometriya va Joylashuv
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-1 p-0 relative'>
            <DetailMapWrapper geometry={mahalla.geometry} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
