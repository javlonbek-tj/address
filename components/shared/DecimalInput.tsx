import { Input } from '@/components/ui/input';
import { ComponentProps } from 'react';

interface DecimalInputProps extends Omit<
  ComponentProps<typeof Input>,
  'onChange' | 'onBlur' | 'value'
> {
  value?: string | number;
  onChange?: (value: string | number | undefined) => void;
  onBlur?: () => void;
  maxDecimals?: number;
  hideZero?: boolean;
}

export function DecimalInput({
  value,
  onChange,
  onBlur,
  maxDecimals = 2,
  placeholder = '45.99',
  hideZero = true,
  ...props
}: DecimalInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      onChange?.('');
      return;
    }

    const normalized = inputValue.replace(',', '.');
    const regex =
      maxDecimals === 0
        ? /^\d+$/
        : new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);

    if (regex.test(normalized)) {
      onChange?.(normalized);
    }
  };

  const handleBlur = () => {
    const stringValue = value?.toString() ?? '';

    if (stringValue === '' || stringValue === '.') {
      onChange?.('');
      onBlur?.();
      return;
    }

    const numValue = parseFloat(stringValue);
    if (!isNaN(numValue)) {
      onChange?.(numValue);
    } else {
      onChange?.('');
    }

    onBlur?.();
  };

  return (
    <Input
      type='text'
      inputMode='decimal'
      value={hideZero && value === 0 ? '' : (value ?? '')}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      {...props}
    />
  );
}
