'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { StreetSchemaType } from '@/lib';
import { streetSchema } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateStreet } from '@/app/actions';
import toast from 'react-hot-toast';
import type { Street } from '@/types';

interface Props {
  street: Street;
  open: boolean;
  onClose: () => void;
  markAsSubmitted: () => void;
}

export function useStreetForm({
  street,
  open,
  onClose,
  markAsSubmitted,
}: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFormattedValues = (street: Street): StreetSchemaType => ({
    name: street?.name || '',
    code: street?.code || '',
    type: street?.type || '',
    uzKadCode: street?.uzKadCode || '',
    mahallas:
      street?.mahalla?.map((m: any) => ({
        mahallaCode: m.code,
        name: m.name,
      })) || [],
    regionId: street?.district?.region?.id || '',
    districtId: street?.district?.id || '',
  });

  const form = useForm<StreetSchemaType>({
    resolver: zodResolver(streetSchema),
    defaultValues: getFormattedValues(street),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormattedValues(street));
    }
  }, [street, form, open]);

  const onSubmit = async (data: StreetSchemaType) => {
    setIsSubmitting(true);
    const result = await updateStreet(street.id, data);

    if (!result.success) {
      toast.error(result.message || "Ko'chani saqlashda xatolik yuz berdi");
      setIsSubmitting(false);
      return;
    }

    markAsSubmitted();
    toast.success("Ko'cha muvaffaqiyatli tahrirlandi");
    queryClient.invalidateQueries({
      queryKey: ['streets-table'],
    });
    queryClient.invalidateQueries({
      queryKey: ['streets-map'],
    });
    onClose();
    setIsSubmitting(false);
  };

  return {
    form,
    isSubmitting,
    onSubmit,
  };
}
