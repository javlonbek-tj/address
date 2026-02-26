import { getPropertyById } from '@/server/data/properties';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 },
      );
    }
    const property = await getPropertyById(id);
    return Response.json({ success: true, data: property });
  } catch (error) {
    console.error('[PROPERTY_BY_ID_API_ERROR]', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
