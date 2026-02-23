'use server';

import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { validateFile } from '@/lib';
import type { ActionResult } from '@/types';

export async function uploadFileAction(
  file: File,
  folderName: string,
): Promise<ActionResult<{ imageUrl: string }>> {
  if (!file) {
    return {
      success: false,
      message: 'Fayl yuklanmagan',
    };
  }

  const validationError = validateFile(file);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const originalName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_');

  const ext = path.extname(file.name).toLowerCase();
  const filename = `${originalName}${ext}`;

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'optimization',
    folderName,
  );

  await mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  const imageUrl = `/uploads/optimization/${folderName}/${filename}`;
  return { success: true, data: { imageUrl } };
}
