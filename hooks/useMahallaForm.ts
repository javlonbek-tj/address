'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import type { MahallaSchemaType } from '@/lib';
import { mahallaSchema } from '@/lib';
import { createMahalla, getFiles, updateMahalla } from '@/app/actions';
import type { Mahalla, Region } from '@/types';

interface Props {
  mahalla: Mahalla | null;
  regions: Region[];
  defaultRegionId?: string;
  defaultDistrictId?: string;
  open: boolean;
  onClose: () => void;
  markAsSubmitted: () => void;
}

export function useMahallaForm({
  mahalla,
  regions,
  defaultRegionId = '',
  defaultDistrictId = '',
  open,
  onClose,
  markAsSubmitted,
}: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFiles, setExistingFiles] = useState<
    Array<{ name: string; url: string }>
  >([]);

  const getFormattedValues = (mahalla: Mahalla | null): MahallaSchemaType => ({
    name: mahalla?.name ?? '',
    code: mahalla?.code ?? '',
    uzKadName: mahalla?.uzKadName ?? '',
    geoCode: mahalla?.geoCode ?? '',
    oneId: mahalla?.oneId ?? '',
    regionId: mahalla?.district?.region?.id ?? defaultRegionId,
    districtId: mahalla?.district?.id ?? defaultDistrictId,
    oldName: mahalla?.oldName,
    regulation: mahalla?.regulation,
    regulationUrl: mahalla?.regulationUrl,
    mergedInto:
      mahalla?.mergedInto.map((m) => ({
        mahallaCode: m.code,
        name: m.name,
      })) || [],
    isOptimized: mahalla?.isOptimized ?? false,
    geometry: undefined,
    mergingMahallas:
      mahalla?.mergedMahallas.map((m) => ({
        mahallaCode: m.code,
        name: m.name,
      })) || [],
  });

  const form = useForm<MahallaSchemaType>({
    resolver: zodResolver(mahallaSchema),
    defaultValues: getFormattedValues(mahalla),
  });

  const regionId = form.watch('regionId');
  const regionName = regions.find((region) => region.id === regionId)?.name;

  useEffect(() => {
    if (open) form.reset(getFormattedValues(mahalla));
  }, [mahalla, form, open]);

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name === 'regionId') form.setValue('districtId', '');
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (!open || !regionName) {
      setExistingFiles([]);
      return;
    }
    getFiles(`optimization/${regionName}`).then(setExistingFiles);
  }, [open, regionName]);

  const onSubmit = async (data: MahallaSchemaType) => {
    setIsSubmitting(true);
    const result = mahalla
      ? await updateMahalla(mahalla.id, data)
      : await createMahalla(data);

    if (!result.success) {
      toast.error(result.message || 'Mahallani saqlashda xatolik yuz berdi');
      setIsSubmitting(false);
      return;
    }

    markAsSubmitted();
    toast.success(
      mahalla
        ? 'Mahalla muvaffaqiyatli tahrirlandi'
        : "Mahalla muvaffaqiyatli qo'shildi",
    );
    queryClient.invalidateQueries({ queryKey: ['mahallas-map'] });
    queryClient.invalidateQueries({ queryKey: ['mahallas-table'] });
    queryClient.invalidateQueries({ queryKey: ['mahallas-list'] });
    onClose();
    setIsSubmitting(false);
  };

  return {
    form,
    regionName,
    isSubmitting,
    onSubmit,
    existingFiles,
  };
}
