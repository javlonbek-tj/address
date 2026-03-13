'use client';

import React from 'react';
import { FilterSelect } from './FilterSelect';
import { LatLngBounds } from 'leaflet';
import L from 'leaflet';

import { useMapFilterStore } from '@/store/useMapFilterStore';
import {
  District,
  MahallaWithRelations,
  Region,
  StreetWithMetadata,
} from '@/types';
import { useSession } from '@/lib/auth/auth-client';
import { UserRole } from '@/lib/generated/prisma/enums';

interface MapFiltersProps {
  regions: Region[];
  filterState: {
    districts: District[];
    mahallas: MahallaWithRelations[];
    streets: StreetWithMetadata[];
    isLoading: boolean;
  };
  setMapBounds: (bounds: LatLngBounds | null) => void;
}

export function MapFilters({
  regions,
  filterState,
  setMapBounds,
}: MapFiltersProps) {
  const { data: session } = useSession();
  const {
    selectedRegion,
    setSelectedRegion,
    selectedDistrict,
    setSelectedDistrict,
    selectedMahalla,
    setSelectedMahalla,
    selectedStreet,
    setSelectedStreet,
  } = useMapFilterStore();

  const user = session?.user;
  const isDistrictUser = user?.role === UserRole.district_user;
  const isRegionUser = user?.role === UserRole.region_user;

  const visibleFiltersCount = [
    !isRegionUser && !isDistrictUser,
    !isDistrictUser,
    true, // Mahalla
    true, // Street
  ].filter(Boolean).length;

  const getGridColsClass = () => {
    switch (visibleFiltersCount) {
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      default:
        return 'grid-cols-1';
    }
  };

  const { districts, mahallas, streets, isLoading } = filterState;

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
    <div className='top-3 left-1/2 z-(--z-map-ui) absolute w-full max-w-[95%] -translate-x-1/2 px-4 transition-all duration-300 md:w-fit md:left-14 md:translate-x-0 2xl:left-1/2 2xl:-translate-x-1/2 md:px-0'>
      <div
        className={`grid ${getGridColsClass()} gap-2.5 p-2 bg-background/95 backdrop-blur-md border rounded-xl shadow-lg transition-opacity duration-200 ${
          isLoading ? 'opacity-70 pointer-events-none' : 'opacity-100'
        }`}
      >
        {!isRegionUser && !isDistrictUser && (
          <FilterSelect
            value={selectedRegion}
            onValueChange={handleRegionChange}
            placeholder='Viloyat'
            options={regions}
            onClear={(e) => clearFilter('region', e)}
          />
        )}
        {!isDistrictUser && (
          <FilterSelect
            value={selectedDistrict}
            onValueChange={handleDistrictChange}
            placeholder='Tuman/Shahar'
            disabled={!selectedRegion}
            options={districts}
            onClear={(e) => clearFilter('district', e)}
          />
        )}
        <FilterSelect
          value={selectedMahalla}
          onValueChange={handleMahallaChange}
          placeholder='Mahalla'
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
