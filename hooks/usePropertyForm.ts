'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  propertySchema,
  updatePropertySchema,
  createPropertySchema,
  type PropertySchemaType,
} from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProperty, updateProperty } from '@/app/actions';
import toast from 'react-hot-toast';
import type { Property, PropertyForForm } from '@/types';

interface Props {
  property: Property | PropertyForForm | null;
  geometry?: any | null;
  open: boolean;
  onClose: () => void;
  markAsSubmitted?: () => void;
}

export function usePropertyForm({
  property,
  geometry,
  open,
  onClose,
  markAsSubmitted,
}: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFormattedValues = (
    property: Property | PropertyForForm | null,
    geometry?: any | null,
  ): PropertySchemaType => ({
    cadNumber: property?.cadNumber || '',
    newCadNumber: property?.newCadNumber || '',
    newHouseNumber: property?.newHouseNumber || '',
    type: property?.type || 'residential',
    regionId: (property as any)?.district?.region?.id || '',
    districtId: (property as any)?.district?.id || '',
    mahallaId: (property as any)?.mahalla?.code || '',
    streetId: (property as any)?.street?.code || null,
    geometry: geometry || (property as any)?.geometry || null,
  });

  const form = useForm<PropertySchemaType>({
    resolver: zodResolver(
      property?.id ? updatePropertySchema : createPropertySchema,
    ),
    defaultValues: getFormattedValues(property, geometry),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormattedValues(property, geometry));
    }
  }, [property, geometry, form, open]);

  const onSubmit = async (data: PropertySchemaType) => {
    setIsSubmitting(true);
    let result;

    if (property?.id) {
      result = await updateProperty(property.id, data);
    } else {
      result = await createProperty(data);
    }

    if (!result.success) {
      toast.error(
        result.message ||
          (property?.id
            ? "Ko'chmas mulkni tahrirlashda xatolik yuz berdi"
            : "Yangi ko'chmas mulk yaratishda xatolik yuz berdi"),
      );
      setIsSubmitting(false);
      return;
    }

    markAsSubmitted?.();
    toast.success(
      property?.id
        ? "Ko'chmas mulk muvaffaqiyatli tahrirlandi"
        : "Yangi ko'chmas mulk muvaffaqiyatli yaratildi",
    );
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
