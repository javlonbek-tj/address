import { getDashboardAnalytics } from '@/server/data/stats';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ErrorMessage } from '@/components/shared';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardAnalytics();

  if (!data) {
    return <ErrorMessage className='min-h-[calc(100vh-4rem)]' />;
  }

  return <DashboardOverview data={data} />;
}
