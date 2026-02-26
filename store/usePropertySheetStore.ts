import { create } from 'zustand';

interface PropertySheetStore {
  selectedPropertyId: string | null;
  open: (id: string) => void;
  close: () => void;
}

export const usePropertySheetStore = create<PropertySheetStore>((set) => ({
  selectedPropertyId: null,
  open: (id) => set({ selectedPropertyId: id }),
  close: () => set({ selectedPropertyId: null }),
}));
