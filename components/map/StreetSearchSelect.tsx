'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface StreetOption {
  id: string;
  name: string;
  type: string;
}

interface Props {
  streets: StreetOption[];
  value: string;
  onChange: (streetId: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}

const MAX_RESULTS = 50;

const streetLabel = (street: StreetOption) => `${street.name} (${street.type})`;

// Users type a plain apostrophe; stored names also use ʻ ʼ ‘ ’.
const normalize = (value: string) => value.replace(/[ʻʼ‘’`]/g, "'").toLowerCase().trim();

// A district can have thousands of streets, so the list is searchable and capped.
export function StreetSearchSelect({ streets, value, onChange, invalid, disabled }: Props) {
  const [query, setQuery] = useState('');
  const selected = streets.find((s) => s.id === value);

  const matches = useMemo(() => {
    const q = normalize(query);
    return streets
      .filter((s) => !q || normalize(streetLabel(s)).includes(q))
      .sort((a, b) => streetLabel(a).localeCompare(streetLabel(b)))
      .slice(0, MAX_RESULTS);
  }, [streets, query]);

  return (
    <div className='flex flex-col gap-1.5'>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={selected ? streetLabel(selected) : "Ko'cha nomini yozing"}
        aria-invalid={invalid}
        disabled={disabled}
        className='h-9'
      />
      <ul className='max-h-40 overflow-y-auto rounded-md border text-sm'>
        {matches.map((street) => (
          <li key={street.id}>
            <button
              type='button'
              disabled={disabled}
              onClick={() => {
                onChange(street.id);
                setQuery('');
              }}
              className={cn(
                'w-full px-2 py-1.5 text-left hover:bg-muted cursor-pointer',
                street.id === value && 'bg-primary/10 font-medium',
              )}
            >
              {streetLabel(street)}
            </button>
          </li>
        ))}
        {matches.length === 0 && (
          <li className='px-2 py-1.5 text-muted-foreground'>Ko&apos;cha topilmadi</li>
        )}
      </ul>
    </div>
  );
}
