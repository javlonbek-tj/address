import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Map, Settings2, Info, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailMapWrapper } from '@/components/map/DetailMapWrapper';
import { Spinner } from '@/components/shared';
import { getPropertyDetailById } from '@/server/data/properties';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import type { Geometry } from 'geojson';

export default async function PropertyDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  return (
    <Suspense fallback={<Spinner />}>
      <PropertyDetailContent id={id} />
    </Suspense>
  );
}

async function PropertyDetailContent({ id }: { id: string }) {
  const property = await getPropertyDetailById(id);

  if (!property) {
    notFound();
  }

  return (
    <div className='p-6 h-full flex flex-col space-y-6'>
      <div className='flex items-center gap-4'>
        <Link href='/properties'>
          <Button variant='outline' size='icon'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
        </Link>
        <h1 className='text-lg font-bold'>
          {property.newCadNumber || property.cadNumber}
        </h1>
        {property.type && (
          <Badge
            variant='secondary'
            className='bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-100 dark:border-purple-800/50'
          >
            {property.type === 'residential' ? 'Turar' : 'Noturar'}
          </Badge>
        )}
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
                  {property.district.region.name}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Tuman:
                </span>
                <span className='col-span-2'>{property.district.name}</span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Mahalla:
                </span>
                <span className='col-span-2'>
                  {property.mahalla?.name || (
                    <span className='text-muted-foreground italic'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Ko'cha:
                </span>
                <span className='col-span-2'>
                  {property.street?.name || (
                    <span className='text-muted-foreground italic'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Yangi uy raqami:
                </span>
                <span className='col-span-2'>
                  {property.newHouseNumber || (
                    <span className='text-muted-foreground italic'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Turi:
                </span>
                <span className='col-span-2'>
                  {property.type ? (
                    property.type === 'residential' ? (
                      'Turar'
                    ) : (
                      'Noturar'
                    )
                  ) : (
                    <span className='text-muted-foreground italic'>
                      Belgilanmagan
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
                Kadastr ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Yangi kadastr raqami:
                </span>
                <span className='col-span-2 font-mono text-xs'>
                  {property.newCadNumber || (
                    <span className='italic text-muted-foreground font-sans'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Eski kadastr raqami:
                </span>
                <span className='col-span-2 font-mono text-xs'>
                  {property.cadNumber || (
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
                <History className='w-4 h-4' />
                Avvalgi manzil ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Avvalgi mahalla:
                </span>
                <span className='col-span-2'>
                  {property.oldMahallaName || (
                    <span className='text-muted-foreground italic'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Avvalgi ko'cha:
                </span>
                <span className='col-span-2'>
                  {property.oldStreetName || (
                    <span className='text-muted-foreground italic'>
                      Mavjud emas
                    </span>
                  )}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2'>
                <span className='font-medium text-muted-foreground col-span-1'>
                  Avvalgi uy raqami:
                </span>
                <span className='col-span-2'>
                  {property.oldHouseNumber || (
                    <span className='text-muted-foreground italic'>
                      Mavjud emas
                    </span>
                  )}
                </span>
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
              geometry={property.geometry as unknown as Geometry}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
