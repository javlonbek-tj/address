import { NextRequest } from 'next/server';
import { getRegionsList } from '@/server';

export async function GET(request: NextRequest) {
  try {
    const data = await getRegionsList();
    return Response.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
