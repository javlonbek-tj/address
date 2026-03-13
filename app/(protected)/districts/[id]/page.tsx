import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Map, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailMapWrapper } from '@/components/map/DetailMapWrapper';
import { Spinner } from '@/components/shared';
import { getDistrictById } from '@/server/data/districts';
import { notFound, redirect } from 'next/navigation';
import type { Geometry } from 'geojson';
import { getServerSession } from '@/lib/auth/session';
import { assertActive, assertDistrictAccess } from '@/lib/auth/authorization';

export default async function DistrictDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const session = await getServerSession();
  if (!session) redirect('/login');

  assertActive(session.user);
  assertDistrictAccess(session.user, id);

  return (
    <Suspense fallback={<Spinner />}>
      <DistrictDetailContent id={id} />
    </Suspense>
  );
}

async function DistrictDetailContent({ id }: { id: string }) {
  const district = await getDistrictById(id);

  if (!district) {
    notFound();
  }

  return (
    <div className='p-6 h-full flex flex-col space-y-6'>
      <div className='flex items-center gap-4'>
        <Link href='/districts'>
          <Button variant='outline' size='icon'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
        </Link>
        <h1 className='text-lg font-bold'>{district.name}</h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
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
                Nomlanishi:
              </span>
              <span className='col-span-2 font-medium'>{district.name}</span>
            </div>
            <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
              <span className='font-medium text-muted-foreground col-span-1'>
                Viloyati:
              </span>
              <span className='col-span-2'>{district.region.name}</span>
            </div>
            <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
              <span className='font-medium text-muted-foreground col-span-1'>
                Soato kodi:
              </span>
              <span className='col-span-2'>{district.code}</span>
            </div>
            <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
              <span className='font-medium text-muted-foreground col-span-1'>
                Mahallalar soni:
              </span>
              <span className='col-span-2'>
                {district.stats?.mahallaCount || 0}
              </span>
            </div>
            <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
              <span className='font-medium text-muted-foreground col-span-1'>
                Ko'chalar soni:
              </span>
              <span className='col-span-2'>
                {district.stats?.streetCount || 0}
              </span>
            </div>
            <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
              <span className='font-medium text-muted-foreground col-span-1'>
                Ko'chmas mulklar soni:
              </span>
              <span className='col-span-2'>
                {district.stats?.propertyCount || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white dark:bg-gray-900 dark:border-white/20 flex flex-col h-125 overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Map className='w-5 h-5' />
              Geometriya va Joylashuv
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-1 p-0 relative'>
            <DetailMapWrapper
              geometry={district.geometry as unknown as Geometry}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
