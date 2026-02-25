'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PropertyWithRelations } from '@/types';
import { usePropertyForm, useStreets } from '@/hooks';
import { Controller } from 'react-hook-form';
import { FormActions } from '@/components/shared';
import {
  Loader2,
  Building2,
  Hash,
  MapPin,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PropertyDetailsSheetProps {
  property: PropertyWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Cadastral Number Input ──────────────────────────────────────────────────
// Format: XX:XX:XX:XX:XX:XXXX  or  XX:XX:XX:XX:XX:XXXX/XXXX
// Segments: [2, 2, 2, 2, 2, 4+optional /XXXX]

function formatCadastralNumber(raw: string): string {
  // Strip everything except digits and slash
  const cleaned = raw.replace(/[^\d/]/g, '');

  // Split on slash for suffix (e.g. 0026/0004)
  const [mainPart, suffixPart] = cleaned.split('/');

  // Segment lengths: 2,2,2,2,2,4
  const segLengths = [2, 2, 2, 2, 2, 4];
  const digits = mainPart || '';
  const segments: string[] = [];
  let pos = 0;

  for (let i = 0; i < segLengths.length; i++) {
    const len = segLengths[i];
    const chunk = digits.slice(pos, pos + len);
    if (!chunk) break;
    segments.push(chunk);
    pos += len;
    if (pos >= digits.length) break;
  }

  let result = segments.join(':');
  if (suffixPart !== undefined) {
    result += '/' + suffixPart;
  }
  return result;
}

function CadastralInput({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Parse value into visual segments for the segmented display
  const segments = value ? value.split(':') : [];
  const isComplete = segments.length >= 6;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatCadastralNumber(raw);
      onChange(formatted);
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (!input) return;

    // Auto-advance: after typing, colons are inserted automatically
    // Allow backspace to work naturally
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className='space-y-2'>
      {/* Segmented visual preview */}
      {value && (
        <div className='flex items-center gap-1 flex-wrap'>
          {value.split(':').map((seg, i) => (
            <span key={i} className='flex items-center gap-1'>
              <span
                className={cn(
                  'inline-flex items-center justify-center font-mono text-xs font-semibold px-2 py-0.5 rounded-md transition-all',
                  i < value.split(':').length - 1
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/50 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-600',
                )}
              >
                {seg || '??'}
              </span>
              {i < value.split(':').length - 1 && (
                <span className='text-gray-300 dark:text-gray-600 text-xs font-bold'>
                  :
                </span>
              )}
            </span>
          ))}
          {isComplete && (
            <CheckCircle2 className='w-4 h-4 text-emerald-500 ml-1 shrink-0' />
          )}
        </div>
      )}

      {/* Input */}
      <div
        className={cn(
          'relative flex items-center rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-900',
          isFocused
            ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
            : hasError
              ? 'border-red-400 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        )}
      >
        <span className='pl-3 pr-1 text-gray-400 dark:text-gray-500'>
          <Hash className='w-4 h-4' />
        </span>
        <input
          ref={inputRef}
          value={value || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder='12:10:44:02:01:0295'
          className='flex-1 bg-transparent py-2.5 px-2 font-mono text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none'
          autoComplete='off'
          spellCheck={false}
        />
        {value && (
          <button
            type='button'
            onClick={handleClear}
            className='pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40'>
          <Icon className='w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400' />
        </div>
        <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>
          {label}
        </span>
      </div>
      <div className='pl-8'>{children}</div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function PropertyDetailsSheet({
  property,
  isOpen,
  onClose,
}: PropertyDetailsSheetProps) {
  const { form, isSubmitting, onSubmit } = usePropertyForm({
    property,
    open: isOpen,
    onClose,
  });

  const { streets, isLoadingStreets } = useStreets(property?.districtId || '');

  if (!property) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className={cn(
          'flex flex-col p-0 z-(--z-sheet) w-full sm:max-w-[440px]',
          'bg-gray-50 dark:bg-[#0f1117]',
          'border-l border-gray-200 dark:border-gray-800',
        )}
      >
        {/* Header */}
        <div className='relative overflow-hidden shrink-0'>
          {/* Decorative gradient bar */}
          <div className='absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' />

          <div className='px-6 pt-7 pb-5'>
            <SheetDescription className='sr-only'>
              Ko&apos;chmas mulk ma&apos;lumotlarini tahrirlash
            </SheetDescription>

            <div className='flex items-start justify-between gap-4'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25'>
                    <Building2 className='w-4 h-4 text-white' />
                  </div>
                  <SheetTitle className='text-base font-bold text-gray-900 dark:text-white'>
                    Ko&apos;chmas mulk
                  </SheetTitle>
                </div>
                {property.cadNumber && (
                  <p className='font-mono text-xs text-gray-500 dark:text-gray-500 pl-10'>
                    {property.cadNumber}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <span className='shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                Tahrirlash
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className='h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-6' />
        </div>

        {/* Scrollable form body */}
        <div className='flex-1 overflow-y-auto'>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='px-6 py-5 space-y-6'
          >
            {/* Cadastral Number */}
            <Section icon={Hash} label='Kadastr raqami'>
              <Controller
                control={form.control}
                name='newCadNumber'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <CadastralInput
                      value={field.value || ''}
                      onChange={field.onChange}
                      hasError={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Section>

            {/* Divider */}
            <div className='h-px bg-gray-200 dark:bg-gray-800' />

            {/* Building Type */}
            <Section icon={Building2} label='Bino turi'>
              <Controller
                control={form.control}
                name='type'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={cn(
                          'w-full rounded-xl border-2 bg-white dark:bg-gray-900 h-11',
                          'border-gray-200 dark:border-gray-700',
                          'hover:border-gray-300 dark:hover:border-gray-600',
                          'focus:border-indigo-500 focus:ring-0',
                          'data-[state=open]:border-indigo-500',
                          'transition-all duration-200',
                          fieldState.invalid &&
                            'border-red-400 dark:border-red-500',
                        )}
                      >
                        <SelectValue placeholder='Turini tanlang' />
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-xl'>
                        {[
                          {
                            value: 'residential',
                            label: 'Turar joy',
                            emoji: '🏠',
                          },
                          {
                            value: 'non-residential',
                            label: 'Noturar joy',
                            emoji: '🏢',
                          },
                          { value: 'other', label: 'Boshqa', emoji: '🏗️' },
                        ].map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className='rounded-lg cursor-pointer'
                          >
                            <span className='flex items-center gap-2'>
                              <span>{opt.emoji}</span>
                              <span>{opt.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Section>

            {/* Divider */}
            <div className='h-px bg-gray-200 dark:bg-gray-800' />

            {/* Street */}
            <Section icon={MapPin} label="Ko'cha">
              <Controller
                control={form.control}
                name='streetId'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Select
                      value={field.value || 'no-street'}
                      onValueChange={(val) =>
                        field.onChange(val === 'no-street' ? null : val)
                      }
                      disabled={isLoadingStreets}
                    >
                      <SelectTrigger
                        className={cn(
                          'w-full rounded-xl border-2 bg-white dark:bg-gray-900 h-11',
                          'border-gray-200 dark:border-gray-700',
                          'hover:border-gray-300 dark:hover:border-gray-600',
                          'focus:border-indigo-500 focus:ring-0',
                          'data-[state=open]:border-indigo-500',
                          'transition-all duration-200',
                          'disabled:opacity-50',
                          fieldState.invalid &&
                            'border-red-400 dark:border-red-500',
                        )}
                      >
                        {isLoadingStreets ? (
                          <div className='flex items-center gap-2 text-gray-500'>
                            <Loader2 className='w-3.5 h-3.5 animate-spin' />
                            <span className='text-sm'>Yuklanmoqda...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Ko'chani tanlang" />
                        )}
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-xl max-h-64'>
                        <SelectItem
                          value='no-street'
                          className='rounded-lg cursor-pointer text-gray-400'
                        >
                          Tanlanmagan
                        </SelectItem>
                        {streets.map((street) => (
                          <SelectItem
                            key={street.code}
                            value={street.code}
                            className='rounded-lg cursor-pointer'
                          >
                            {street.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Section>
          </form>
        </div>

        {/* Footer actions — pinned to bottom */}
        <div className='shrink-0 px-6 py-4 bg-white dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 backdrop-blur-sm'>
          <FormActions
            onCancel={onClose}
            isEditing={true}
            isPending={isSubmitting}
            editText='Saqlash'
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
