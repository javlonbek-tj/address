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
    oldName: mahalla?.oldName || '',
    regulation: mahalla?.regulation || '',
    regulationUrl: mahalla?.regulationUrl || '',
    isOptimized: mahalla?.hidden || false,
    mergingMahallas: [],
  });

  const form = useForm<MahallaSchemaType>({
    defaultValues: getFormattedValues(mahalla),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormattedValues(mahalla));
    }
  }, [mahalla, form, open]);

  const fetchMahallaByCode = async (code: string) => {
    if (!code || code.length < 3) return null;
    try {
      const response = await fetch(`/api/mahallas?search=${code}`);
      const result = await response.json();
      if (result.success && result.data?.data?.[0]) {
        return result.data.data[0];
      }
    } catch (error) {
      console.error('Failed to fetch mahalla:', error);
    }
    return null;
  };

  const onSubmit = async (data: MahallaSchemaType) => {
    setIsSubmitting(true);
    const result = mahalla?.id
      ? await updateMahalla(mahalla.id, data)
      : await updateMahalla('', data); // Need to handle create if needed, but the current action is updateMahalla.

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
    fetchMahallaByCode,
  };
}
