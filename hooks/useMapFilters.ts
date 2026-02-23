'use client';

import { useState } from 'react';
import { useDistricts, useMahallas, useStreets } from './';
import type { BaseMapKey } from '@/lib/constants/map';

export function useMapFilters() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMahalla, setSelectedMahalla] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');

  const [showRegions, setShowRegions] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);
  const [showMahallas, setShowMahallas] = useState(true);
  const [showStreets, setShowStreets] = useState(true);

  const [baseMap, setBaseMap] = useState<BaseMapKey>('osm');

  // 1. Fetch Districts (Only if a region is selected)
  const { districts, isLoadingDistricts } = useDistricts(selectedRegion);

  // 2. Fetch Mahallas (Only if a district is selected)
  const { mahallas, isLoadingMahallas } = useMahallas(selectedDistrict);

  // 3. Fetch Streets (Only if a district is selected)
  const { streets, isLoadingStreets } = useStreets(selectedDistrict);

  const handleSetSelectedRegion = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedDistrict('');
    setSelectedMahalla('');
    setSelectedStreet('');
  };

  const handleSetSelectedDistrict = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedMahalla('');
    setSelectedStreet('');
  };

  const handleSetSelectedMahalla = (mahallaId: string) => {
    setSelectedMahalla(mahallaId);
    setSelectedStreet('');
  };

  return {
    selectedRegion,
    setSelectedRegion: handleSetSelectedRegion,
    selectedDistrict,
    setSelectedDistrict: handleSetSelectedDistrict,
    selectedMahalla,
    setSelectedMahalla: handleSetSelectedMahalla,
    selectedStreet,
    setSelectedStreet,
    districts,
    mahallas,
    streets,
    showRegions,
    setShowRegions,
    showDistricts,
    setShowDistricts,
    showMahallas,
    setShowMahallas,
    showStreets,
    setShowStreets,
    baseMap,
    setBaseMap,
    isLoading: isLoadingDistricts || isLoadingMahallas || isLoadingStreets,
  };
}
