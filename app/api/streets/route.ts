import { NextRequest } from 'next/server';
import { getStreetsByDistrictId } from '@/server';

export async function GET(request: NextRequest) {
  try {
    const districtId = request.nextUrl.searchParams.get('districtId');
    if (!districtId) {
      return Response.json(
        { success: false, error: 'District ID required' },
        { status: 400 },
      );
    }

    const data = await getStreetsByDistrictId(districtId);
    return Response.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
