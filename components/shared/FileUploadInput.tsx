'use client';

import React, { useRef, useState } from 'react';
import { Upload, Check, X, Eye, Loader2 } from 'lucide-react';

interface FileUploadProps {
  value?: string;
  fileName: string | null;
  isUploading?: boolean;
  disabled?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  accept?: string;
}

export const FileUploadInput = ({
  value,
  fileName,
  isUploading = false,
  disabled = false,
  onUpload,
  onRemove,
  accept,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await onUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className='relative group'>
      <input
        ref={fileInputRef}
        type='file'
        accept={accept}
        onChange={handleFileChange}
        className='hidden'
        disabled={isUploading || disabled}
      />

      <div
        onClick={() =>
          !isUploading && !disabled && fileInputRef.current?.click()
        }
        className={`
            flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer
            ${
              value
                ? 'border-green-500/50 bg-green-500/5 dark:bg-green-500/10'
                : `border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5 hover:border-blue-500/50 ${isDragging ? 'border-blue-500/50' : ''}`
            }
            ${isUploading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='w-8 h-8 text-blue-500 animate-spin' />
            <span className='text-sm font-medium text-blue-600'>
              Fayl yuklanmoqda...
            </span>
          </div>
        ) : value ? (
          <div className='flex flex-col items-center gap-2'>
            <div className='w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center'>
              <Check className='w-6 h-6 text-green-600' />
            </div>
            <span className='text-sm font-semibold text-green-700 dark:text-green-400 text-center'>
              Hujjat yuklandi
            </span>
            <span className='text-xs text-muted-foreground truncate max-w-xs px-4'>
              {fileName?.split('/')?.pop() || value.split('/').pop()}
            </span>

            <div className='flex gap-3 mt-2'>
              <a
                href={value}
                target='_blank'
                rel='noopener noreferrer'
                onClick={(e) => e.stopPropagation()}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors'
              >
                <Eye className='w-3.5 h-3.5' /> Ko'rish
              </a>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors'
              >
                <X className='w-3.5 h-3.5' /> O'chirish
              </button>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-2'>
            <div className='w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors'>
              <Upload className='w-6 h-6 text-blue-600' />
            </div>
            <span className='text-sm font-semibold text-gray-700 dark:text-gray-300 text-center px-4'>
              Fayl yuklash
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
