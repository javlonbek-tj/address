'use client';

import { useUpdatePropertyForm } from '@/hooks/useUpdatePropertyForm';
import type { Region, District, Property } from '@/types';

import { PropertyFormDialog } from './PropertyFormDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  property: Property;
  regions: Region[];
  districts: District[];
}

export function UpdatePropertyDialog({
  open,
  onClose,
  property,
  regions,
  districts,
}: Props) {
  const { form, isSubmitting, onSubmit } = useUpdatePropertyForm({
    property,
    open,
    onClose,
  });

  return (
    <PropertyFormDialog
      open={open}
      onClose={onClose}
      title="Ko'chmas mulkni tahrirlash"
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      regions={regions}
      districts={districts}
      isEditing
    />
  );
}
