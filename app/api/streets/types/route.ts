import { getServerSession } from '@/lib/auth/session';
import { getStreetTypes } from '@/server';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const types = await getStreetTypes();
    return Response.json({ success: true, data: types });
  } catch {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
