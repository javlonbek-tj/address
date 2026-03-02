import { NextResponse } from 'next/server';
import { getUserTableData } from '@/server/data/users';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || 'all';
  const status = searchParams.get('status') || 'all';
  const regionId = searchParams.get('regionId') || 'all';
  const districtId = searchParams.get('districtId') || 'all';

  try {
    const data = await getUserTableData({
      page,
      limit,
      search,
      role,
      status,
      regionId,
      districtId,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('API: Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
