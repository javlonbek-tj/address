'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { DistrictSchemaType } from '@/lib';
import { updateDistrict } from '@/app/actions';
import toast from 'react-hot-toast';
import type { District } from '@/types';

interface Props {
  district: District;
  open: boolean;
  onClose: () => void;
}

export function useDistrictForm({ district, open, onClose }: Props) {
  const [submitting, setIsSubmitting] = useState(false);

  const form = useForm<DistrictSchemaType>({
    defaultValues: district,
  });

  useEffect(() => {
    if (open) {
      form.reset(district);
    }
  }, [district, form, open]);

  const onSubmit = async (data: DistrictSchemaType) => {
    if (!district?.id) return;
    setIsSubmitting(true);
    const result = await updateDistrict(district.id, data);

    if (!result.success) {
      toast.error(result.message || 'Tumanni tahrirlashda xatolik yuz berdi');
      setIsSubmitting(false);
      return;
    }

    toast.success('Tuman muvaffaqiyatli tahrirlandi');
    onClose();
    setIsSubmitting(false);
  };

  return {
    form,
    submitting,
    onSubmit,
  };
}
