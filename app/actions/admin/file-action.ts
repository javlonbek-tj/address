'use server';

import { mkdir, writeFile, unlink, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import { validateFile } from '@/lib';
import type { ActionResult } from '@/types';

export async function uploadFileAction(
  file: File,
  folderName: string,
  preserveName: boolean = false,
  acceptedFileTypes: string[],
): Promise<ActionResult<{ imageUrl: string }>> {
  if (!file) {
    return {
      success: false,
      message: 'Fayl yuklanmagan',
    };
  }

  const validationError = validateFile(file, acceptedFileTypes);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const originalName = file.name
    .replace(/\.[^/.]+$/, '') // remove extension
    .trim()
    .replace(/[^a-zA-Z0-9.-]/g, '_') // replace special characters with underscore
    .replace(/_+/g, '_') // replace multiple underscores with single underscore
    .replace(/^_+|_+$/g, '') // remove leading and trailing underscores
    .slice(0, 80); // limit to 80 characters

  const ext = path.extname(file.name).toLowerCase();
  let filename: string;
  if (preserveName) {
    filename = `${originalName}${ext}`;
  } else {
    const shortId = nanoid(6);
    filename = `${originalName}_${shortId}${ext}`;
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folderName);

  await mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  const imageUrl = `/uploads/${folderName}/${filename}`;
  return { success: true, data: { imageUrl } };
}

export async function removeFile(imageUrl: string) {
  try {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
      return;
    }

    const filepath = path.join(process.cwd(), 'public', imageUrl);

    const normalized = path.normalize(filepath);
    const publicDir = path.join(process.cwd(), 'public');
    if (!normalized.startsWith(publicDir)) {
      return;
    }

    if (existsSync(filepath)) {
      await unlink(filepath);
    }
  } catch (error) {
    console.error('[IMAGE_DELETE_ERROR]', error);
  }
}

export async function getFiles(folderName: string) {
  if (!folderName) return [];
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folderName);

  if (!existsSync(uploadDir)) {
    return [];
  }

  try {
    const files = await readdir(uploadDir);
    const fileData = files.map((file) => ({
      name: file,
      url: `/uploads/${folderName}/${file}`,
    }));
    return fileData;
  } catch (error) {
    console.error('[GET_FILES_ERROR]', error);
    return [];
  }
}
