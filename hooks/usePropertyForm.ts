'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { PropertySchemaType } from '@/lib';
import { propertySchema } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProperty } from '@/app/actions';
import toast from 'react-hot-toast';
import type { Property, PropertyForForm } from '@/types';

interface Props {
  property: Property | PropertyForForm | null;
  open: boolean;
  onClose: () => void;
  markAsSubmitted?: () => void;
}

export function usePropertyForm({
  property,
  open,
  onClose,
  markAsSubmitted,
}: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFormattedValues = (
    property: Property | PropertyForForm | null,
  ): PropertySchemaType => ({
    cadNumber: property?.cadNumber || '',
    newCadNumber: property?.newCadNumber || '',
    newHouseNumber: property?.newHouseNumber || '',
    type: property?.type || 'residential',
    regionId: property?.district?.region?.id || '',
    districtId: property?.district?.id || '',
    mahallaId: property?.mahalla?.code || '',
    streetId: property?.street?.code || null,
  });

  const form = useForm<PropertySchemaType>({
    resolver: zodResolver(propertySchema),
    defaultValues: getFormattedValues(property),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormattedValues(property));
    }
  }, [property, form, open]);

  const onSubmit = async (data: PropertySchemaType) => {
    if (!property) return;

    setIsSubmitting(true);
    const result = await updateProperty(property.id, data);

    if (!result.success) {
      toast.error(
        result.message || "Ko'chmas mulkni saqlashda xatolik yuz berdi",
      );
      setIsSubmitting(false);
      return;
    }

    markAsSubmitted?.();
    toast.success("Ko'chmas mulk muvaffaqiyatli tahrirlandi");
    queryClient.invalidateQueries({
      queryKey: ['properties-table'],
    });
    queryClient.invalidateQueries({
      queryKey: ['properties-map'],
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
