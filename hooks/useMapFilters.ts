'use client';

import { useState } from 'react';
import { useDistricts } from './useDistricts';
import { useMahallas } from './useMahallas';

export function useMapFilters() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMahalla, setSelectedMahalla] = useState('');

  // 1. Fetch Districts (Only if a region is selected)
  const { districts, isLoadingDistricts } = useDistricts(selectedRegion);

  // 2. Fetch Mahallas (Only if a district is selected)
  const { mahallas, isLoadingMahallas } = useMahallas(selectedDistrict);

  const handleSetSelectedRegion = (region: string) => {
    setSelectedRegion(region);
    setSelectedDistrict('');
    setSelectedMahalla('');
  };

  const handleSetSelectedDistrict = (district: string) => {
    setSelectedDistrict(district);
    setSelectedMahalla('');
  };

  return {
    selectedRegion,
    setSelectedRegion: handleSetSelectedRegion,
    selectedDistrict,
    setSelectedDistrict: handleSetSelectedDistrict,
    selectedMahalla,
    setSelectedMahalla,
    districts,
    mahallas,
    isLoading: isLoadingDistricts || isLoadingMahallas,
  };
}
