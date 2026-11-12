import { create } from 'zustand';
import type { StreetNumbers } from '@/types';
import { usePropertySheetStore } from './usePropertySheetStore';

export type NumberingSide = 'left' | 'right';

type Step =
  | { kind: 'assign'; propertyId: string; houseNumber: string; prevNumber: number }
  | { kind: 'reserve'; houseNumbers: string[]; prevNumber: number };

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

const defaultStartNumber = (side: NumberingSide) => (side === 'left' ? '1' : '2');

// Left side = odd numbers (1, 3, 5…), right side = even numbers (2, 4, 6…).
export const isValidStartNumber = (side: NumberingSide, value: string) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n % 2 === (side === 'left' ? 1 : 0);
};

interface NumberingSessionState {
  isPanelOpen: boolean;
  // Chosen before the session starts; fixed while isActive so zoom/street clicks can't change it.
  streetId: string;
  side: NumberingSide;
  startInput: string;
  isActive: boolean;
  letterMode: boolean;
  // Next sequence number before skipping reserved numbers.
  currentNumber: number;
  steps: Step[];
  // Numbers already used or reserved on the street in the database.
  streetNumbers: StreetNumbers;

  openPanel: () => void;
  setStreet: (streetId: string) => void;
  setSide: (side: NumberingSide) => void;
  setStartInput: (value: string) => void;
  setStreetNumbers: (numbers: StreetNumbers) => void;
  toggleLetterMode: () => void;
  startSession: () => void;
  // Returns an Uzbek message when nothing could be assigned.
  assignNext: (propertyId: string) => string | null;
  reserve: (count: number) => void;
  undoLast: () => void;
  cancelSession: () => void;
  switchSide: () => void;
  endSession: () => void;
}

type SessionData = Pick<
  NumberingSessionState,
  'currentNumber' | 'steps' | 'streetNumbers' | 'startInput' | 'letterMode'
>;

export const sessionAssignments = (steps: Step[]) =>
  steps.flatMap((s) => (s.kind === 'assign' ? [{ propertyId: s.propertyId, houseNumber: s.houseNumber }] : []));

export const sessionReserved = (steps: Step[]) => steps.flatMap((s) => (s.kind === 'reserve' ? s.houseNumbers : []));

// The next sequence number that is not reserved in the database.
export const nextSequenceNumber = ({ currentNumber, streetNumbers }: SessionData) => {
  const reserved = new Set(streetNumbers.reserved);
  let n = currentNumber;
  while (reserved.has(String(n))) n += 2;
  return n;
};

// Letter numbers continue the last house assigned in this session (15 → 15a, even after a reserve),
// or the number before the start number when nothing was assigned yet.
const letterBase = ({ steps, startInput }: SessionData) => {
  const lastAssign = [...steps].reverse().find((s) => s.kind === 'assign');
  if (lastAssign && lastAssign.kind === 'assign') return parseInt(lastAssign.houseNumber, 10);
  const base = Number(startInput) - 2;
  return base >= 1 ? base : null;
};

export const nextLetterNumber = (data: SessionData) => {
  const base = letterBase(data);
  if (base === null) return null;
  const taken = new Set([
    ...data.streetNumbers.used,
    ...data.streetNumbers.reserved,
    ...sessionAssignments(data.steps).map((a) => a.houseNumber),
    ...sessionReserved(data.steps),
  ]);
  const letter = [...LETTERS].find((l) => !taken.has(`${base}${l}`));
  return letter ? `${base}${letter}` : null;
};

const initialState = {
  isPanelOpen: false,
  streetId: '',
  side: 'left' as NumberingSide,
  startInput: '1',
  isActive: false,
  letterMode: false,
  currentNumber: 1,
  steps: [] as Step[],
  streetNumbers: { used: [], reserved: [] } as StreetNumbers,
};

export const useNumberingSessionStore = create<NumberingSessionState>((set, get) => ({
  ...initialState,

  openPanel: () => {
    usePropertySheetStore.getState().closeSheet();
    set({ ...initialState, isPanelOpen: true });
  },

  setStreet: (streetId) => {
    if (!get().isActive) set({ streetId });
  },

  setSide: (side) => set({ side, startInput: defaultStartNumber(side) }),

  setStartInput: (startInput) => set({ startInput }),

  setStreetNumbers: (streetNumbers) => set({ streetNumbers }),

  toggleLetterMode: () => set({ letterMode: !get().letterMode }),

  startSession: () => {
    const { streetId, side, startInput } = get();
    if (!streetId || !isValidStartNumber(side, startInput)) return;
    usePropertySheetStore.getState().closeSheet();
    set({ isActive: true, letterMode: false, currentNumber: Number(startInput), steps: [] });
  },

  assignNext: (propertyId) => {
    const state = get();
    if (!state.isActive) return null;
    if (state.steps.some((s) => s.kind === 'assign' && s.propertyId === propertyId)) return null;

    if (state.letterMode) {
      const houseNumber = nextLetterNumber(state);
      if (!houseNumber) {
        return letterBase(state) === null
          ? "Harfli raqam uchun oldingi uy raqami yo'q"
          : "Bu raqam uchun bo'sh harf qolmadi (a–z)";
      }
      set({ steps: [...state.steps, { kind: 'assign', propertyId, houseNumber, prevNumber: state.currentNumber }] });
      return null;
    }

    const n = nextSequenceNumber(state);
    set({
      steps: [...state.steps, { kind: 'assign', propertyId, houseNumber: String(n), prevNumber: state.currentNumber }],
      currentNumber: n + 2,
    });
    return null;
  },

  reserve: (count) => {
    const state = get();
    if (!state.isActive || !Number.isInteger(count) || count < 1) return;
    const houseNumbers: string[] = [];
    let next = state.currentNumber;
    for (let i = 0; i < count; i++) {
      const n = nextSequenceNumber({ ...state, currentNumber: next });
      houseNumbers.push(String(n));
      next = n + 2;
    }
    set({
      steps: [...state.steps, { kind: 'reserve', houseNumbers, prevNumber: state.currentNumber }],
      currentNumber: next,
    });
  },

  undoLast: () => {
    const { steps } = get();
    const last = steps[steps.length - 1];
    if (!last) return;
    set({ steps: steps.slice(0, -1), currentNumber: last.prevNumber });
  },

  cancelSession: () =>
    set({ isActive: false, letterMode: false, steps: [], currentNumber: Number(get().startInput) || 1 }),

  switchSide: () => {
    const side: NumberingSide = get().side === 'left' ? 'right' : 'left';
    set({ isActive: false, letterMode: false, steps: [], side, startInput: defaultStartNumber(side) });
  },

  endSession: () => set(initialState),
}));
