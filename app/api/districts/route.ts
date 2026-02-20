import { NextRequest } from 'next/server';
import { getDistrictsByRegionId } from '@/server';

export async function GET(request: NextRequest) {
  try {
    const regionId = request.nextUrl.searchParams.get('regionId');
    if (!regionId) {
      return Response.json(
        { success: false, error: 'Region ID required' },
        { status: 400 },
      );
    }

    const data = await getDistrictsByRegionId(regionId);
    return Response.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
