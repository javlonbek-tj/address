import { NextResponse } from 'next/server';
import { getSessionsTableData } from '@/server/data/sessions';
import { getServerSession } from '@/lib/auth/session';
import { assertSuperadmin } from '@/lib/auth/authorization';

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  assertSuperadmin(session.user);

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  try {
    const data = await getSessionsTableData({ page, limit });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
