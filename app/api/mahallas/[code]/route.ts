import { getMahallaByCode } from '@/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    if (!code) {
      return Response.json(
        { success: false, error: 'Code is required' },
        { status: 400 },
      );
    }
    const mahalla = await getMahallaByCode(code);

    if (!mahalla) {
      return Response.json(
        { success: false, error: 'Mahalla not found' },
        { status: 404 },
      );
    }
    return Response.json({ success: true, data: mahalla });
  } catch (error) {
    console.error('[MAHALLA_BY_CODE_API_ERROR]', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
