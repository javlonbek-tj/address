import { Header } from '@/components/header';
import { MapWrapper } from '@/components/map';
import { AppSidebar } from '@/components/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { getRegions } from '@/server';

export default async function HomePage() {
  const regions = await getRegions();
  return (
    <>
      <AppSidebar />
      <div className='flex flex-col flex-1 border-l'>
        <Header />
        <SidebarInset>
          <MapWrapper regions={regions} />
        </SidebarInset>
      </div>
    </>
  );
}
