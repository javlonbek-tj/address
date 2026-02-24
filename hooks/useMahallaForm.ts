'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { MahallaSchemaType } from '@/lib';
import { mahallaSchema } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFiles, updateMahalla } from '@/app/actions';
import toast from 'react-hot-toast';
import type { Mahalla } from '@/types';
import { useEffect } from 'react';

interface Props {
  mahalla: Mahalla;
  open: boolean;
  onClose: () => void;
  markAsSubmitted: () => void;
}

export function useMahallaForm({
  mahalla,
  open,
  onClose,
  markAsSubmitted,
}: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFiles, setExistingFiles] = useState<
    Array<{ name: string; url: string }>
  >([]);

  const getFormattedValues = (mahalla: Mahalla): MahallaSchemaType => ({
    name: mahalla?.name || '',
    code: mahalla?.code || '',
    uzKadName: mahalla?.uzKadName || '',
    geoCode: mahalla?.geoCode || '',
    oneId: mahalla?.oneId || '',
    regionId: mahalla?.district?.region?.id || '',
    districtId: mahalla?.district?.id || '',
    hidden: !!mahalla?.hidden,
    oldName: mahalla?.oldName || null,
    regulation: mahalla?.regulation || null,
    regulationUrl: mahalla?.regulationUrl || null,
    isOptimized: !!mahalla?.hidden || !!mahalla?.mergedIntoId,
    mergingMahallas: [],
  });

  const form = useForm<MahallaSchemaType>({
    resolver: zodResolver(mahallaSchema),
    defaultValues: getFormattedValues(mahalla),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormattedValues(mahalla));

      const getExistingFiles = async () => {
        const files = await getFiles(
          `optimization/${mahalla?.district?.region?.name}`,
        );
        setExistingFiles(files);
      };
      if (mahalla?.district?.region?.id) {
        getExistingFiles();
      }
    }
  }, [mahalla, form, open]);

  const onSubmit = async (data: MahallaSchemaType) => {
    setIsSubmitting(true);
    const result = await updateMahalla(mahalla.id, data);

    if (!result.success) {
      toast.error(result.message || 'Mahallani saqlashda xatolik yuz berdi');
      setIsSubmitting(false);
      return;
    }

    markAsSubmitted();
    toast.success('Mahalla muvaffaqiyatli tahrirlandi');
    queryClient.invalidateQueries({ queryKey: ['mahallas'] });
    queryClient.invalidateQueries({ queryKey: ['mahallas-table-data'] });
    onClose();
    setIsSubmitting(false);
  };

  return {
    form,
    isSubmitting,
    onSubmit,
    existingFiles,
  };
}
