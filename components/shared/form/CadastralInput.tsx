'use client';

import { formatCadastralNumber } from '@/lib';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormInputField } from './FormInputField';

interface Props {
  name: string;
  label?: string;
}

export const CadastralInput = ({ name, label = 'Kadastr raqami' }: Props) => {
  const { watch, setValue, clearErrors } = useFormContext();
  const value = watch(name) || '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCadastralNumber(e.target.value);
      setValue(name, formatted, { shouldValidate: false });
      clearErrors(name);
    },
    [name, setValue, clearErrors],
  );

  return (
    <FormInputField
      controlled
      value={value}
      onChange={handleChange}
      placeholder='12:10:44:02:01:0295'
      label={label}
      name={name}
      autoComplete='off'
      spellCheck={false}
    />
  );
};
