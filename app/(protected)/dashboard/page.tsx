import { getDashboardAnalytics } from '@/server/data/stats';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ErrorMessage } from '@/components/shared';
import { getServerSession } from '@/lib/auth/session';
import { assertMinRole } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';

export default async function DashboardPage() {
  const session = await getServerSession();
  assertMinRole(session!.user, UserRole.admin);
  const data = await getDashboardAnalytics();

  const isEmpty =
    data && data.counts.regions === 0 && data.counts.districts === 0;

  if (!data || isEmpty) {
    return (
      <ErrorMessage
        title="Ma'lumot topilmadi"
        description='Hozircha tizimda hech qanday statistika mavjud emas.'
        className='min-h-[calc(100vh-4rem)]'
      />
    );
  }

  return <DashboardOverview data={data} />;
}
