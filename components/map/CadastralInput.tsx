import { formatCadastralNumber } from '@/lib';
import { useCallback } from 'react';
import { FormInputField } from '../shared';
import { useFormContext } from 'react-hook-form';

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
      setValue(name, formatted, { shouldValidate: false }); // ← don't validate on every keystroke
      clearErrors(name); // ← clear error manually as user types
    },
    [name, setValue, clearErrors],
  );

  return (
    <FormInputField
      controlled // ← skips register(), no double-binding
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
