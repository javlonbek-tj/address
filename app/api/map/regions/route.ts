import { NextRequest } from 'next/server';
import { getRegions } from '@/server';

export async function GET(request: NextRequest) {
  try {
    const data = await getRegions();
    return Response.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
