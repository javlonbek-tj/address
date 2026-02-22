'use client';

import React from 'react';
import { useMapFilters } from '@/hooks';
import type { Region } from '@/lib/generated/prisma/client';
import { FilterSelect } from './FilterSelect';
import { LatLngBounds } from 'leaflet';
import L from 'leaflet';

interface MapFiltersProps {
  regions: Region[];
  filterState: ReturnType<typeof useMapFilters>;
  setMapBounds: (bounds: LatLngBounds | null) => void;
}

export function MapFilters({
  regions,
  filterState,
  setMapBounds,
}: MapFiltersProps) {
  const {
    selectedRegion,
    setSelectedRegion,
    districts,
    selectedDistrict,
    setSelectedDistrict,
    mahallas,
    selectedMahalla,
    setSelectedMahalla,
    streets,
    selectedStreet,
    setSelectedStreet,
    isLoading,
  } = filterState;

  const flyToItem = (
    items: { id: string; geometry?: unknown }[],
    id: string,
  ) => {
    const item = items.find((item) => item.id === id);
    if (!item?.geometry) return;

    const layer = L.geoJSON(item.geometry as GeoJSON.Geometry);
    setMapBounds(layer.getBounds());
  };

  const handleRegionChange = (id: string) => {
    setSelectedRegion(id);
    flyToItem(regions, id);
  };

  const handleDistrictChange = (id: string) => {
    setSelectedDistrict(id);
    flyToItem(filterState.districts, id);
  };

  const handleMahallaChange = (id: string) => {
    setSelectedMahalla(id);
    flyToItem(filterState.mahallas, id);
  };

  const clearFilter = (
    level: 'region' | 'district' | 'mahalla' | 'street',
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    switch (level) {
      case 'region':
        setSelectedRegion('');
        setMapBounds(null);
        break;
      case 'district':
        setSelectedDistrict('');
        break;
      case 'mahalla':
        setSelectedMahalla('');
        break;
      case 'street':
        setSelectedStreet('');
        break;
    }
  };

  return (
    <div className="top-3 left-1/3 z-9999 absolute ml-8 w-fit max-w-[95%] -translate-x-1/2">
      <div
        className={`grid grid-cols-2 xl:grid-cols-4 gap-2 p-1 md:p-1.5 bg-background/95 backdrop-blur-md border rounded-lg shadow-lg transition-opacity duration-200 ${
          isLoading ? 'opacity-70 pointer-events-none' : 'opacity-100'
        }`}
      >
        <FilterSelect
          value={selectedRegion}
          onValueChange={handleRegionChange}
          placeholder="Viloyat"
          options={regions}
          onClear={(e) => clearFilter('region', e)}
        />
        <FilterSelect
          value={selectedDistrict}
          onValueChange={handleDistrictChange}
          placeholder="Tuman/Shahar"
          disabled={!selectedRegion}
          options={districts}
          onClear={(e) => clearFilter('district', e)}
        />
        <FilterSelect
          value={selectedMahalla}
          onValueChange={handleMahallaChange}
          placeholder="Mahalla"
          disabled={!selectedDistrict}
          options={mahallas}
          onClear={(e) => clearFilter('mahalla', e)}
        />
        <FilterSelect
          value={selectedStreet}
          onValueChange={setSelectedStreet}
          placeholder="Ko'cha"
          disabled={!selectedMahalla}
          options={streets}
          onClear={(e) => clearFilter('street', e)}
        />
      </div>
    </div>
  );
}
