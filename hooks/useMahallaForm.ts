'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { MahallaSchemaType } from '@/lib';
import { updateMahalla } from '@/app/actions';
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

  const getFormattedValues = (mahalla: Mahalla): MahallaSchemaType => ({
    name: mahalla?.name || '',
    code: mahalla?.code || '',
    uzKadName: mahalla?.uzKadName || '',
    geoCode: mahalla?.geoCode || '',
    oneId: mahalla?.oneId || '',
    regionId: mahalla?.district?.region?.id || '',
    districtId: mahalla?.district?.id || '',
    hidden: mahalla?.hidden || false,
    mergedIntoId: mahalla?.mergedIntoId || '',
    mergedIntoName: mahalla?.mergedIntoName || '',
    oldName: mahalla?.oldName || '',
    regulation: mahalla?.regulation || '',
    regulationUrl: mahalla?.regulationUrl || '',
  });

  const form = useForm<MahallaSchemaType>({
    defaultValues: getFormattedValues(mahalla),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormattedValues(mahalla));
    }
  }, [mahalla, form, open]);

  const onSubmit = async (data: MahallaSchemaType) => {
    if (!mahalla?.id) return;
    setIsSubmitting(true);
    const result = await updateMahalla(mahalla.id, data);

    if (!result.success) {
      toast.error(result.message || 'Mahallani tahrirlashda xatolik yuz berdi');
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
  };
}
