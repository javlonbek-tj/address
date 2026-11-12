'use client';

import { useDistricts, useMahallas, useStreets } from './';
import { useMapFilterStore } from '@/store/useMapFilterStore';

export function useMapFilters() {
  const { selectedRegion, selectedDistrict } = useMapFilterStore();

  const { districts, isLoadingDistricts } = useDistricts(selectedRegion);
  const { mahallas, isLoadingMahallas } = useMahallas(selectedDistrict);
  const { streets, isLoadingStreets } = useStreets(selectedDistrict);

  return {
    districts,
    mahallas,
    streets,
    isLoading: isLoadingDistricts || isLoadingMahallas || isLoadingStreets,
  };
}
