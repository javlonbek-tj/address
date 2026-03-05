'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import type { Geometry } from 'geojson';
import { type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import {
  createPropertySchema,
  CreatePropertySchemaType,
  PROPERTY_TYPES,
} from '@/lib';
import { createProperty } from '@/app/actions';

interface Props {
  geometry: Geometry | null;
  onClose: () => void;
  markAsSubmitted?: () => void;
}

export function useCreatePropertyForm({
  geometry,
  onClose,
  markAsSubmitted,
}: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialValues = useCallback(
    (geom: Geometry | null): CreatePropertySchemaType => ({
      cadNumber: '',
      newCadNumber: '',
      newHouseNumber: '',
      type: PROPERTY_TYPES.RESIDENTIAL,
      regionId: '',
      districtId: '',
      mahallaId: '',
      streetId: '',
      geometry: geom as Geometry,
    }),
    [],
  );

  const form = useForm<CreatePropertySchemaType>({
    resolver: zodResolver(
      createPropertySchema,
    ) as Resolver<CreatePropertySchemaType>,
    defaultValues: getInitialValues(geometry),
  });

  const onSubmit = async (data: CreatePropertySchemaType) => {
    setIsSubmitting(true);
    const result = await createProperty(data);

    if (!result.success) {
      toast.error(
        result.message || "Yangi ko'chmas mulk yaratishda xatolik yuz berdi",
      );
      setIsSubmitting(false);
      return;
    }

    markAsSubmitted?.();
    toast.success("Yangi ko'chmas mulk muvaffaqiyatli yaratildi");
    queryClient.invalidateQueries({ queryKey: ['properties-table'] });
    queryClient.invalidateQueries({ queryKey: ['properties-map'] });
    onClose();
    setIsSubmitting(false);
  };

  return { form, isSubmitting, onSubmit };
}
