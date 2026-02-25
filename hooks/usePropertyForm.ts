'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { PropertySchemaType } from '@/lib';
import { propertySchema } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProperty } from '@/app/actions';
import toast from 'react-hot-toast';
import type { PropertyWithRelations } from '@/types';
import { useEffect } from 'react';

interface Props {
  property: PropertyWithRelations | null;
  open: boolean;
  onClose: () => void;
}

export function usePropertyForm({ property, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFormattedValues = (
    property: PropertyWithRelations | null,
  ): PropertySchemaType => ({
    newCadNumber: property?.newCadNumber || null,
    type: property?.type || 'residential',
    streetId: property?.streetId || null,
  });

  const form = useForm<PropertySchemaType>({
    resolver: zodResolver(propertySchema),
    defaultValues: getFormattedValues(property),
  });

  useEffect(() => {
    if (open && property) {
      form.reset(getFormattedValues(property));
    }
  }, [property, form, open]);

  const onSubmit = async (data: PropertySchemaType) => {
    if (!property) return;

    setIsSubmitting(true);
    const result = await updateProperty(property.id, data);

    if (!result.success) {
      toast.error(result.message || 'Obyektni saqlashda xatolik yuz berdi');
      setIsSubmitting(false);
      return;
    }

    toast.success('Obyekt muvaffaqiyatli tahrirlandi');
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    onClose();
    setIsSubmitting(false);
  };

  return {
    form,
    isSubmitting,
    onSubmit,
  };
}
