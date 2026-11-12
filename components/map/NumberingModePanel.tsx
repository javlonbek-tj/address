'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Download, ListOrdered, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { batchAssignHouseNumbersAction } from '@/app/actions';
import { useStreets } from '@/hooks/useStreets';
import { useExportProperties } from '@/hooks/useExportProperties';
import { cn } from '@/lib/utils';
import { useMapFilterStore } from '@/store/useMapFilterStore';
import {
  isValidStartNumber,
  useNumberingSessionStore,
  type NumberingSide,
} from '@/store/useNumberingSessionStore';
import { StreetSearchSelect } from './StreetSearchSelect';

const SIDES: { side: NumberingSide; label: string }[] = [
  { side: 'left', label: 'Chap tomon (1, 3, 5…)' },
  { side: 'right', label: "O'ng tomon (2, 4, 6…)" },
];

export function NumberingModePanel({ candidateCount }: { candidateCount: number }) {
  const selectedDistrict = useMapFilterStore((s) => s.selectedDistrict);
  const selectedMahalla = useMapFilterStore((s) => s.selectedMahalla);
  const selectedStreet = useMapFilterStore((s) => s.selectedStreet);
  const setSelectedStreet = useMapFilterStore((s) => s.setSelectedStreet);
  const session = useNumberingSessionStore();
  const { streets } = useStreets(selectedDistrict);
  const { exportToExcel, isExporting } = useExportProperties();
  const queryClient = useQueryClient();

  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  // Conflicts from the last failed save; stale once the assignments change.
  const [failedSave, setFailedSave] = useState<{ key: string; numbers: number[] | 'all' } | null>(null);

  const { isPanelOpen, isActive, streetId, setStreet, assignments } = session;
  const assignmentsKey = assignments.map((a) => a.propertyId).join(',');
  const conflicts = failedSave?.key === assignmentsKey ? failedSave.numbers : [];

  // A street clicked on the map becomes the numbering street until the session starts.
  useEffect(() => {
    if (isPanelOpen && !isActive && selectedStreet) setStreet(selectedStreet);
  }, [isPanelOpen, isActive, selectedStreet, setStreet]);

  if (!selectedDistrict) return null;

  if (!isPanelOpen) {
    return (
      <div className='absolute bottom-8 right-3 z-(--z-map-ui) flex gap-2'>
        <Button
          variant='outline'
          disabled={isExporting}
          onClick={() =>
            exportToExcel(selectedDistrict, selectedMahalla || undefined).catch(() =>
              toast.error('Excel faylini yuklashda xatolik yuz berdi'),
            )
          }
          className='bg-background shadow-lg cursor-pointer'
        >
          {isExporting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Download className='h-4 w-4' />}
          Excel
        </Button>
        <Button
          onClick={() => {
            setHasSaved(false);
            session.openPanel();
          }}
          className='shadow-lg cursor-pointer'
        >
          <ListOrdered className='h-4 w-4' />
          Raqamlash
        </Button>
      </div>
    );
  }

  const street = streets.find((s) => s.id === streetId);
  const streetName = street ? `${street.name} ${street.type}` : '';
  const startValid = isValidStartNumber(session.side, session.startInput);

  const save = async () => {
    setIsSaving(true);
    const result = await batchAssignHouseNumbersAction({ streetId, assignments });
    setIsSaving(false);

    if (result.success) {
      toast.success(`${assignments.length} ta binoga uy raqami berildi`);
      queryClient.invalidateQueries({ queryKey: ['properties', selectedDistrict] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
      setHasSaved(true);
      session.switchSide();
      return;
    }
    if (result.error === 'DUPLICATE_HOUSE_NUMBER') {
      const numbers = result.data && 'numbers' in result.data ? result.data.numbers : [];
      setFailedSave({ key: assignmentsKey, numbers: numbers.length ? numbers.map(Number) : 'all' });
    }
    toast.error(result.message || 'Saqlashda xatolik yuz berdi');
  };

  return (
    <div className='absolute top-3 right-3 z-(--z-map-ui) w-80 max-h-[calc(50%-6rem)] overflow-y-auto rounded-xl border bg-background/95 shadow-xl backdrop-blur-md'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <h3 className='font-semibold'>Yarim avtomatik raqamlash</h3>
        <button
          type='button'
          onClick={session.endSession}
          disabled={isSaving}
          className='rounded-md p-1 hover:bg-muted cursor-pointer'
          aria-label='Yopish'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      {!isActive ? (
        <div className='flex flex-col gap-4 p-4 text-sm'>
          <div className='flex flex-col gap-1.5'>
            <span className='font-medium'>Ko&apos;cha</span>
            <StreetSearchSelect
              streets={streets}
              value={streetId}
              onChange={(id) => {
                setStreet(id);
                setSelectedStreet(id);
              }}
            />
            {streetId && (
              <span className='text-muted-foreground'>
                Ko&apos;cha yaqinidagi raqamsiz binolar: <b>{candidateCount} ta</b>
              </span>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <span className='font-medium'>Qaysi tomondan boshlaysiz?</span>
            <div className='grid grid-cols-2 gap-2'>
              {SIDES.map(({ side, label }) => (
                <Button
                  key={side}
                  type='button'
                  variant={session.side === side ? 'default' : 'outline'}
                  onClick={() => session.setSide(side)}
                  className='h-auto whitespace-normal py-2 cursor-pointer'
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <span className='font-medium'>Boshlash raqami</span>
            <Input
              type='number'
              min={1}
              value={session.startInput}
              onChange={(e) => session.setStartInput(e.target.value)}
              aria-invalid={!startValid}
              className='h-9'
            />
            {!startValid && (
              <span className='text-xs text-red-500'>
                Chap tomon uchun toq, o&apos;ng tomon uchun juft raqam kiriting
              </span>
            )}
          </div>

          <div className='flex gap-2'>
            {hasSaved && (
              <Button variant='outline' onClick={session.endSession} className='flex-1 cursor-pointer'>
                Tugatish
              </Button>
            )}
            <Button
              onClick={session.startSession}
              disabled={!streetId || !startValid || candidateCount === 0}
              className='flex-1 cursor-pointer'
            >
              Boshlash
            </Button>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-3 p-4 text-sm'>
          <div>
            <div className='font-medium'>{streetName}</div>
            <div className='text-muted-foreground'>
              {session.side === 'left' ? 'Chap tomon (toq raqamlar)' : "O'ng tomon (juft raqamlar)"}
            </div>
          </div>

          <div className='rounded-md bg-muted px-3 py-2 font-medium'>
            Belgilandi: {assignments.length} ta | Keyingi raqam: {session.currentNumber}
          </div>

          <p className='text-muted-foreground'>
            Ko&apos;cha bo&apos;ylab binolarni ketma-ket bosing. Faqat sariq rangdagi binolarni tanlash mumkin.
          </p>

          {assignments.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {assignments.map((a) => {
                const conflict = conflicts === 'all' || conflicts.includes(a.houseNumber);
                return (
                  <span
                    key={a.propertyId}
                    className={cn(
                      'rounded px-1.5 py-0.5 text-xs font-semibold',
                      conflict ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-800',
                    )}
                  >
                    {a.houseNumber}
                  </span>
                );
              })}
            </div>
          )}

          <div className='grid grid-cols-2 gap-2'>
            <Button
              variant='outline'
              onClick={session.undoLast}
              disabled={!assignments.length || isSaving}
              className='cursor-pointer'
            >
              Orqaga qaytish
            </Button>
            <Button onClick={save} disabled={!assignments.length || isSaving} className='cursor-pointer'>
              {isSaving && <Loader2 className='h-4 w-4 animate-spin' />}
              Saqlash
            </Button>
            <Button
              variant='ghost'
              onClick={session.cancelSession}
              disabled={isSaving}
              className='col-span-2 cursor-pointer'
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
