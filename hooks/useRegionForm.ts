'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Region } from '@/types';
import { updateRegion } from '@/app/actions';
import toast from 'react-hot-toast';

interface Props {
  region: Region;
  open: boolean;
  onClose: () => void;
}

export function useRegionForm({ region, open, onClose }: Props) {
  const [submitting, setIsSubmitting] = useState(false);

  const form = useForm<Region>({
    defaultValues: region,
  });

  useEffect(() => {
    if (open) {
      form.reset(region);
    }
  }, [region, form, open]);

  const onSubmit = async (data: Region) => {
    if (!region?.id) return;
    setIsSubmitting(true);
    const result = await updateRegion(region.id, data);

    if (!result.success) {
      toast.error(result.message || 'Hududni tahrirlashda xatolik yuz berdi');
      setIsSubmitting(false);
      return;
    }

    toast.success('Hudud muvaffaqiyatli tahrirlandi');
    onClose();
    setIsSubmitting(false);
  };

  return {
    form,
    submitting,
    onSubmit,
  };
}
