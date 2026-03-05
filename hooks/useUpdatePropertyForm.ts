'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import {
  updatePropertySchema,
  UpdatePropertySchemaType,
  PROPERTY_TYPES,
} from '@/lib';
import { updateProperty } from '@/app/actions';
import type { Property } from '@/types';

interface Props {
  property: Property;
  open: boolean;
  onClose: () => void;
}

export function useUpdatePropertyForm({ property, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFormattedValues = useCallback(
    (prop: Property): UpdatePropertySchemaType => ({
      cadNumber: prop.cadNumber || '',
      newCadNumber: prop.newCadNumber || '',
      newHouseNumber: prop.newHouseNumber || '',
      type: prop.type || (PROPERTY_TYPES.RESIDENTIAL as string),
      regionId: prop.district?.region?.id || '',
      districtId: prop.district?.id || '',
      mahallaId: prop.mahalla?.code || '',
      streetId: prop.street?.code || '',
    }),
    [],
  );

  const form = useForm<UpdatePropertySchemaType>({
    resolver: zodResolver(
      updatePropertySchema,
    ) as Resolver<UpdatePropertySchemaType>,
    defaultValues: getFormattedValues(property),
  });

  const { reset } = form;

  useEffect(() => {
    if (open && property) {
      reset(getFormattedValues(property));
    }
  }, [property, reset, open, getFormattedValues]);

  const onSubmit = async (data: UpdatePropertySchemaType) => {
    setIsSubmitting(true);
    const result = await updateProperty(property.id, data);

    if (!result.success) {
      toast.error(
        result.message || "Ko'chmas mulkni tahrirlashda xatolik yuz berdi",
      );
      setIsSubmitting(false);
      return;
    }

    toast.success("Ko'chmas mulk muvaffaqiyatli tahrirlandi");
    queryClient.invalidateQueries({ queryKey: ['properties-table'] });
    queryClient.invalidateQueries({ queryKey: ['properties-map'] });
    onClose();
    setIsSubmitting(false);
  };

  return { form, isSubmitting, onSubmit };
}
