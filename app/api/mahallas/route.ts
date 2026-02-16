import { NextRequest, NextResponse } from 'next/server';
import { getMahallas } from '@/server/data/mahallas';

export async function GET(request: NextRequest) {
  const districtId = request.nextUrl.searchParams.get('districtId');
  if (!districtId) {
    return NextResponse.json(
      { error: 'District ID required' },
      { status: 400 },
    );
  }

  const data = await getMahallas(districtId);
  return NextResponse.json(data);
}
