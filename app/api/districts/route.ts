import { NextRequest, NextResponse } from 'next/server';
import { getDistricts } from '@/server/data/districts';

export async function GET(request: NextRequest) {
  const regionId = request.nextUrl.searchParams.get('regionId');
  if (!regionId) {
    return NextResponse.json({ error: 'Region ID required' }, { status: 400 });
  }

  const data = await getDistricts(regionId);
  return NextResponse.json(data);
}
