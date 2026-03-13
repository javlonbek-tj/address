import { NextRequest } from 'next/server';
import { getRegionsList } from '@/server';

export async function GET(request: NextRequest) {
  try {
    const data = await getRegionsList();
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
