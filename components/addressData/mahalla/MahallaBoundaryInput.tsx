'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Loader2, MapPinned, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';
import { DetailMapWrapper } from '@/components/map/DetailMapWrapper';
import { parseBoundaryFile } from '@/lib/geo/parseBoundaryFile';
import type { MahallaSchemaType } from '@/lib';

export function MahallaBoundaryInput() {
  const form = useFormContext<MahallaSchemaType>();
  const geometry = form.watch('geometry');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleFile = async (file: File) => {
    setIsParsing(true);
    setError('');
    try {
      const parsed = await parseBoundaryFile(file);
      form.setValue('geometry', parsed, { shouldDirty: true });
      setFileName(file.name);
    } catch (e) {
      form.setValue('geometry', undefined);
      setFileName('');
      setError(e instanceof Error ? e.message : "Faylni o'qib bo'lmadi");
    }
    setIsParsing(false);
  };

  const handleClear = () => {
    form.setValue('geometry', undefined);
    setFileName('');
    setError('');
  };

  const polygonCount =
    geometry?.type === 'MultiPolygon' ? geometry.coordinates.length : 1;

  return (
    <div className='space-y-3 mt-4 border dark:border-gray-700 rounded-xl p-3'>
      <div className='flex items-center justify-between gap-2'>
        <FieldLabel
          htmlFor='mahalla-boundary-file'
          className='flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400'
        >
          <MapPinned className='w-4 h-4' />
          Chegara (GeoJSON yoki SHP .zip)
        </FieldLabel>
        {geometry && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleClear}
            className='h-7 px-2 text-red-500 hover:text-red-700 text-xs'
          >
            <X className='w-3 h-3 mr-1' />
            Bekor qilish
          </Button>
        )}
      </div>

      <input
        id='mahalla-boundary-file'
        type='file'
        accept='.geojson,.json,.zip'
        disabled={isParsing}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
        className='block w-full text-xs text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 file:cursor-pointer'
      />

      {isParsing && (
        <p className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Loader2 className='w-3 h-3 animate-spin' />
          Fayl o&apos;qilmoqda...
        </p>
      )}

      {error && <p className='text-xs text-red-600 dark:text-red-400'>{error}</p>}

      {!geometry && !error && !isParsing && (
        <p className='text-[11px] text-muted-foreground'>
          Fayl tanlanmasa, mavjud chegara o&apos;zgarmaydi. SHP uchun .shp, .dbf
          va .prj fayllarini bitta .zip ga joylang.
        </p>
      )}

      {geometry && (
        <>
          <p className='text-xs text-emerald-600 dark:text-emerald-400'>
            {fileName}: {polygonCount} ta poligon. Saqlanganda mahalla chegarasi
            shu bilan almashtiriladi.
          </p>
          <div className='h-56 rounded-lg overflow-hidden border dark:border-gray-700'>
            <DetailMapWrapper geometry={geometry} />
          </div>
        </>
      )}
    </div>
  );
}
