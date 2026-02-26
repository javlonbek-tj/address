import { getStreetsByDistrictId } from '@/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ districtId: string }> },
) {
  try {
    const { districtId } = await params;
    if (!districtId) {
      return Response.json(
        { success: false, error: 'District ID is required' },
        { status: 400 },
      );
    }
    const streets = await getStreetsByDistrictId(districtId);
    return Response.json({ success: true, data: streets });
  } catch (error) {
    console.error('[STREETS_BY_DISTRICT_ID_API_ERROR]', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
