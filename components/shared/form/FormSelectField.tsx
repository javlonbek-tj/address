'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequiredSymbol } from './RequiredSymbol';

interface Option {
  id: string;
  name: string;
}

interface FormSelectFieldProps {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  requiredSymbol?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FormSelectField({
  name,
  label,
  options,
  placeholder,
  requiredSymbol = false,
  className,
  disabled = false,
}: FormSelectFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel>
            {label}
            {requiredSymbol && <RequiredSymbol />}
          </FieldLabel>
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className='w-full h-10'>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && (
            <FieldError errors={[fieldState.error]} className='text-xs' />
          )}
        </Field>
      )}
    />
  );
}
