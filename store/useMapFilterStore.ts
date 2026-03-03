import { create } from 'zustand';
import type { BaseMapKey } from '@/lib/constants/map';

interface MapFilterState {
  selectedRegion: string;
  selectedDistrict: string;
  selectedMahalla: string;
  selectedStreet: string;

  showRegions: boolean;
  showDistricts: boolean;
  showMahallas: boolean;
  showStreets: boolean;
  showProperties: boolean;

  baseMap: BaseMapKey;

  // Drawing state
  isDrawing: boolean;
  drawGeometry: any | null;
  isCreatePropertyOpen: boolean;

  // Actions
  setSelectedRegion: (id: string) => void;
  setSelectedDistrict: (id: string) => void;
  setSelectedMahalla: (id: string) => void;
  setSelectedStreet: (id: string) => void;

  setShowRegions: (show: boolean) => void;
  setShowDistricts: (show: boolean) => void;
  setShowMahallas: (show: boolean) => void;
  setShowStreets: (show: boolean) => void;
  setShowProperties: (show: boolean) => void;

  setBaseMap: (baseMap: BaseMapKey) => void;

  // Drawing actions
  setIsDrawing: (isDrawing: boolean) => void;
  setDrawGeometry: (geometry: any | null) => void;
  setIsCreatePropertyOpen: (isOpen: boolean) => void;

  resetFilters: () => void;
}

const initialState = {
  selectedRegion: '',
  selectedDistrict: '',
  selectedMahalla: '',
  selectedStreet: '',
  showRegions: true,
  showDistricts: true,
  showMahallas: true,
  showStreets: true,
  showProperties: true,
  baseMap: 'osm' as BaseMapKey,
  isDrawing: false,
  drawGeometry: null,
  isCreatePropertyOpen: false,
};

export const useMapFilterStore = create<MapFilterState>((set) => ({
  ...initialState,

  setSelectedRegion: (id) =>
    set({
      selectedRegion: id,
      selectedDistrict: '',
      selectedMahalla: '',
      selectedStreet: '',
    }),

  setSelectedDistrict: (id) =>
    set({
      selectedDistrict: id,
      selectedMahalla: '',
      selectedStreet: '',
    }),

  setSelectedMahalla: (id) =>
    set({
      selectedMahalla: id,
      selectedStreet: '',
    }),

  setSelectedStreet: (id) => set({ selectedStreet: id }),

  setShowRegions: (show) => set({ showRegions: show }),
  setShowDistricts: (show) => set({ showDistricts: show }),
  setShowMahallas: (show) => set({ showMahallas: show }),
  setShowStreets: (show) => set({ showStreets: show }),
  setShowProperties: (show) => set({ showProperties: show }),

  setBaseMap: (baseMap) => set({ baseMap }),

  setIsDrawing: (isDrawing) => set({ isDrawing }),
  setDrawGeometry: (drawGeometry) => set({ drawGeometry }),
  setIsCreatePropertyOpen: (isOpen) => set({ isCreatePropertyOpen: isOpen }),

  resetFilters: () => set(initialState),
}));
