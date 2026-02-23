'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Region } from '@/types';
import { updateRegion } from '@/app/actions';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { RegionSchemaType } from '@/lib';

interface Props {
  region: Region;
  open: boolean;
  onClose: () => void;
}

export function useRegionForm({ region, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [submitting, setIsSubmitting] = useState(false);

  const getFormattedValues = (region: Region): RegionSchemaType => ({
    name: region?.name || '',
    code: region?.code || '',
  });

  const form = useForm<RegionSchemaType>({
    defaultValues: getFormattedValues(region),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormattedValues(region));
    }
  }, [region, form, open]);

  const onSubmit = async (data: RegionSchemaType) => {
    if (!region?.id) return;
    setIsSubmitting(true);
    const result = await updateRegion(region.id, data);

    if (!result.success) {
      toast.error(result.message || 'Hududni tahrirlashda xatolik yuz berdi');
      setIsSubmitting(false);
      return;
    }

    toast.success('Hudud muvaffaqiyatli tahrirlandi');
    queryClient.invalidateQueries({ queryKey: ['regions'] });
    queryClient.invalidateQueries({ queryKey: ['regions-table-data'] });
    onClose();
    setIsSubmitting(false);
  };

  return {
    form,
    submitting,
    onSubmit,
  };
}
