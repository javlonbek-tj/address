import { NextRequest } from 'next/server';
import { getPropertiesByMahallaCode } from '@/server/data/properties';

export async function GET(request: NextRequest) {
  try {
    const mahallaCode = request.nextUrl.searchParams.get('mahallaCode');
    if (!mahallaCode) {
      return Response.json(
        { success: false, error: 'Mahalla Code required' },
        { status: 400 },
      );
    }

    const data = await getPropertiesByMahallaCode(mahallaCode);
    return Response.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
