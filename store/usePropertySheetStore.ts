import { create } from 'zustand';

interface PropertySheetState {
  selectedPropertyId: string | null;
  isOpen: boolean;
  openSheet: (propertyId: string) => void;
  closeSheet: () => void;
}

export const usePropertySheetStore = create<PropertySheetState>((set) => ({
  selectedPropertyId: null,
  isOpen: false,
  openSheet: (propertyId) => set({ selectedPropertyId: propertyId, isOpen: true }),
  closeSheet: () => set({ selectedPropertyId: null, isOpen: false }),
}));
