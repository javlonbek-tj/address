import { NextRequest } from 'next/server';
import { getDistrictsList } from '@/server';

export async function GET(request: NextRequest) {
  try {
    const regionId = request.nextUrl.searchParams.get('regionId') || 'all';
    const data = await getDistrictsList(regionId);
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
