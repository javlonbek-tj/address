import { NextRequest } from 'next/server';
import { getDistrictTableData } from '@/server';

export async function GET(request: NextRequest) {
  try {
    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;
    const search = request.nextUrl.searchParams.get('search') || '';
    const regionId = request.nextUrl.searchParams.get('regionId') || '';
    const data = await getDistrictTableData({
      page,
      limit,
      search,
      regionId: regionId === 'all' ? undefined : regionId,
    });
    return Response.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
