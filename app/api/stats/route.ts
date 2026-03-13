import { NextRequest } from 'next/server';
import {
  getGlobalStatistics,
  getRegionStatistics,
  getDistrictStatistics,
} from '@/server';

export async function GET(request: NextRequest) {
  try {
    const regionId = request.nextUrl.searchParams.get('regionId');
    const districtId = request.nextUrl.searchParams.get('districtId');
    let data;
    if (districtId) {
      data = await getDistrictStatistics(districtId);
    } else if (regionId) {
      data = await getRegionStatistics(regionId);
    } else {
      data = await getGlobalStatistics();
    }

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
