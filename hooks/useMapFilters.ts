'use client';

import { useDistricts, useMahallas, useStreets, useProperties } from './';
import { useMapFilterStore } from '@/store/useMapFilterStore';

export function useMapFilters() {
  const { selectedRegion, selectedDistrict, selectedMahalla } =
    useMapFilterStore();

  // 1. Fetch Districts (Only if a region is selected)
  const { districts, isLoadingDistricts } = useDistricts(selectedRegion);

  // 2. Fetch Mahallas (Only if a district is selected)
  const { mahallas, isLoadingMahallas } = useMahallas(selectedDistrict);

  // 3. Fetch Streets (Only if a district is selected)
  const { streets, isLoadingStreets } = useStreets(selectedDistrict);

  // 4. Fetch Properties (Only if a mahalla is selected)
  const selectedMahallaData = mahallas.find((m) => m.id === selectedMahalla);
  const { properties, isLoadingProperties } = useProperties(
    selectedMahallaData?.code || null,
  );

  return {
    districts,
    mahallas,
    streets,
    properties,
    isLoading:
      isLoadingDistricts ||
      isLoadingMahallas ||
      isLoadingStreets ||
      isLoadingProperties,
  };
}
