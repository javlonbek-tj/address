import { useState } from 'react';
import { useDistricts, useMahallas, useStreets } from './';

export function useMapFilters() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMahalla, setSelectedMahalla] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');

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
    isLoading: isLoadingDistricts || isLoadingMahallas || isLoadingStreets,
  };
}
