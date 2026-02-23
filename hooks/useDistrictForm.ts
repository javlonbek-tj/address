'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { DistrictSchemaType } from '@/lib';
import { updateDistrict } from '@/app/actions';
import toast from 'react-hot-toast';
import type { District } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  district: District;
  open: boolean;
  onClose: () => void;
}

export function useDistrictForm({ district, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [submitting, setIsSubmitting] = useState(false);

  const getFormattedValues = (district: District): DistrictSchemaType => ({
    name: district?.name || '',
    code: district?.code || '',
    regionId: district?.regionId || '',
  });

  const form = useForm<DistrictSchemaType>({
    defaultValues: getFormattedValues(district),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormattedValues(district));
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

    queryClient.invalidateQueries({ queryKey: ['districts'] });
    queryClient.invalidateQueries({ queryKey: ['districts-table-data'] });
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
