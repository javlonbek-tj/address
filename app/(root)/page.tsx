import { MapWrapper } from '@/components/map';
import { getRegions } from '@/server';
import { ErrorMessage } from '@/components/shared';

export default async function HomePage() {
  const regions = await getRegions();

  if (!regions || regions.length === 0) {
    return <ErrorMessage className='min-h-[calc(100vh-4rem)]' />;
  }

  return <MapWrapper regions={regions} />;
}
