'use client';
import { useFormContext } from 'react-hook-form';
import { ClearButton } from './ClearButton';
import { cn } from '@/lib/utils';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RequiredSymbol } from './RequiredSymbol';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  requiredSymbol?: boolean;
  className?: string;
  type?: string;
  isTextArea?: boolean;
  hasClearBtn?: boolean;
  suffix?: React.ReactNode;
  controlled?: boolean;
}

export function FormInputField({
  name,
  label,
  requiredSymbol = false,
  className,
  isTextArea = false,
  hasClearBtn = true,
  suffix,
  controlled = false,
  ...props
}: Props) {
  const {
    register,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  // Only watch when NOT controlled — avoids double watch re-render
  const value = controlled ? props.value : watch(name);
  const fieldError = errors[name];
  const isFieldInvalid = !!fieldError;
  const onClear = () => setValue(name, '', { shouldValidate: true });

  // Register props only when not controlled
  const registeredProps = controlled
    ? {}
    : register(name, {
        onChange: () => {
          if (fieldError) clearErrors(name);
        },
      });

  return (
    <Field data-invalid={isFieldInvalid}>
      {label && (
        <FieldLabel htmlFor={name}>
          {label}
          {requiredSymbol && <RequiredSymbol />}
        </FieldLabel>
      )}
      {isTextArea ? (
        <Textarea
          {...register(name)}
          className={cn('min-h-25 text-md resize-none')}
        />
      ) : (
        <div className='relative'>
          <Input
            id={name}
            {...registeredProps}
            aria-invalid={isFieldInvalid}
            {...props}
            className={cn('pr-20 h-10 text-md', className)}
          />
          {value && !suffix && hasClearBtn && <ClearButton onClick={onClear} />}
          {suffix && (
            <div className='top-1/2 right-2 absolute -translate-y-1/2 pointer-events-auto'>
              {suffix}
            </div>
          )}
        </div>
      )}
      {isFieldInvalid && (
        <FieldError errors={[fieldError]} className='text-xs' />
      )}
    </Field>
  );
}
