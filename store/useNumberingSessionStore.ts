import { create } from 'zustand';
import { usePropertySheetStore } from './usePropertySheetStore';

export type NumberingSide = 'left' | 'right';

export const defaultStartNumber = (side: NumberingSide) => (side === 'left' ? '1' : '2');

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
  currentNumber: number;
  assignments: { propertyId: string; houseNumber: number }[];

  openPanel: () => void;
  setStreet: (streetId: string) => void;
  setSide: (side: NumberingSide) => void;
  setStartInput: (value: string) => void;
  startSession: () => void;
  assignNext: (propertyId: string) => void;
  undoLast: () => void;
  cancelSession: () => void;
  switchSide: () => void;
  endSession: () => void;
}

const initialState = {
  isPanelOpen: false,
  streetId: '',
  side: 'left' as NumberingSide,
  startInput: '1',
  isActive: false,
  currentNumber: 1,
  assignments: [],
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

  startSession: () => {
    const { streetId, side, startInput } = get();
    if (!streetId || !isValidStartNumber(side, startInput)) return;
    usePropertySheetStore.getState().closeSheet();
    set({ isActive: true, currentNumber: Number(startInput), assignments: [] });
  },

  assignNext: (propertyId) => {
    const { isActive, assignments, currentNumber } = get();
    if (!isActive || assignments.some((a) => a.propertyId === propertyId)) return;
    set({
      assignments: [...assignments, { propertyId, houseNumber: currentNumber }],
      currentNumber: currentNumber + 2,
    });
  },

  undoLast: () => {
    const { assignments, currentNumber } = get();
    if (!assignments.length) return;
    set({ assignments: assignments.slice(0, -1), currentNumber: currentNumber - 2 });
  },

  cancelSession: () => set({ isActive: false, assignments: [], currentNumber: Number(get().startInput) || 1 }),

  switchSide: () => {
    const side: NumberingSide = get().side === 'left' ? 'right' : 'left';
    set({ isActive: false, assignments: [], side, startInput: defaultStartNumber(side) });
  },

  endSession: () => set(initialState),
}));
