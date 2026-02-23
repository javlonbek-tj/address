'use client';

import { useEffect, useState } from 'react';
import { deleteImageFile, uploadFileAction } from '@/app/actions';

export function useImageUpload(
  initialImageUrl: string | null,
  open: boolean,
  imageFolder: string,
  originalImageUrl: string | null,
) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPreviewUrl(initialImageUrl ?? '');
    setUploadedImageUrl('');
    setIsSubmitted(false);
  }, [open, initialImageUrl]);

  const removeImage = async () => {
    if (uploadedImageUrl && uploadedImageUrl !== originalImageUrl) {
      await deleteImageFile(uploadedImageUrl);
      setUploadedImageUrl('');
    }
    setPreviewUrl('');
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const result = await uploadFileAction(file, imageFolder);
    if (result.success) {
      setUploadedImageUrl(result.data?.imageUrl || '');
      setPreviewUrl(result.data?.imageUrl || '');
    }
    setIsUploading(false);
    return result;
  };

  const cleanupOrphanedImage = async () => {
    if (
      uploadedImageUrl &&
      !isSubmitted &&
      uploadedImageUrl !== originalImageUrl
    ) {
      try {
        await deleteImageFile(uploadedImageUrl);
      } catch (error) {
        console.error('Failed to delete orphaned image:', error);
      }
    }
  };

  return {
    previewUrl,
    uploadedImageUrl,
    removeImage,
    cleanupOrphanedImage,
    markAsSubmitted: () => setIsSubmitted(true),
    uploadFile,
    isUploading,
  };
}
